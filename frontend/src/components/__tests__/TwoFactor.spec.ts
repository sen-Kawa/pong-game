import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, shallowMount, flushPromises, type VueWrapper } from '@vue/test-utils'
import TwoFactor from '@/components/user/TwoFactor.vue'
import { createTestingPinia } from '@pinia/testing'
import axios from 'axios'
import waitForExpect from 'wait-for-expect'
import MockAdapter from 'axios-mock-adapter'
import { useAuthStore } from '@/stores/auth'

const mock = new MockAdapter(axios)
const baseUrlauth = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}`

describe('Unit test of the TwoFactor Component', () => {
  let wrapper: any = null

  beforeEach(() => {
    wrapper = shallowMount(TwoFactor, {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false
        })
      ]
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })
  it('renders the component with activated 2fa', async () => {
    wrapper.vm.activated2FA = true
    await waitForExpect(() => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('button').length).toEqual(1)
      expect(wrapper.findAll('button').at(0).text()).toBe('deactivate 2fa')
    })
  })
  it('renders the component with deactivated 2fa', async () => {
    wrapper.vm.activated2FA = false
    await waitForExpect(() => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('button').length).toEqual(1)
      expect(wrapper.findAll('button').at(0).text()).toBe('activate 2fa')
    })
  })

  it('renders the component with an url', async () => {
    wrapper.vm.url = 'test'
    wrapper.vm.activated2FA = false
    await waitForExpect(() => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('button').length).toEqual(2)
      expect(wrapper.findAll('button').at(0).text()).toBe('activate 2fa')
      expect(wrapper.findAll('button').at(1).text()).toBe('Send code')
    })
  })
})
describe('Integration Test of the Validation2FA Component', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(TwoFactor, {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false
        })
      ]
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAll('button').length).toEqual(1)
    expect(wrapper.findAll('button').at(0)?.text()).toBe('activate 2fa')
  })
  it('clicking the activate 2fa creates an qr image', async () => {
    mock.onGet(baseUrlauth + 'activate2FA').reply(200, { url: baseUrl + '/TestUrl' })
    await wrapper.find('.change2fa').trigger('click')
    await flushPromises()
    await waitForExpect(() => {
      expect(wrapper.findAll('button').length).toEqual(2)
      expect(wrapper.findAll('button').at(0)?.text()).toBe('activate 2fa')
      expect(wrapper.findAll('button').at(1)?.text()).toBe('Send code')
      expect(wrapper.findAll('img').length).toEqual(1)
      expect(wrapper.findAll('img').at(0)?.element.src).toBe(baseUrl + '/TestUrl')
    })
  })

  it('sending a valid code reset the url and error', async () => {
    mock.onGet(baseUrlauth + 'activate2FA').reply(200, { url: baseUrl + '/TestUrl' })
    mock.onPost(baseUrlauth + 'verifyactivate2fa').reply(200)
    const authStore = useAuthStore()
    authStore.$patch({ userProfile: { activated2FA: false } })
    const spy = vi.spyOn(authStore, 'activate2FA')
    await wrapper.find('.change2fa').trigger('click')
    await wrapper.find('input').setValue('123456')
    await wrapper.find('.codeSend').trigger('click')
    await flushPromises()
    await waitForExpect(() => {
      expect(spy).toBeCalledTimes(1)
      expect(wrapper.findAll('button').length).toEqual(1)
      expect(wrapper.findAll('button').at(0)?.text()).toBe('deactivate 2fa')
      expect(wrapper.findAll('img').length).toEqual(0)
      // @ts-ignore
      expect(wrapper.vm.url).toBe('')
      // @ts-ignore
      expect(wrapper.vm.error).toBe(null)
    })
  })

  it('sending a invalid code, displays an error', async () => {
    mock.onGet(baseUrlauth + 'activate2FA').reply(200, { url: baseUrl + '/TestUrl' })
    mock.onPost(baseUrlauth + 'verifyactivate2fa').reply(403, { message: 'the test works' })
    const authStore = useAuthStore()
    authStore.$patch({ userProfile: { activated2FA: false } })
    const spy = vi.spyOn(authStore, 'activate2FA')
    await wrapper.find('.change2fa').trigger('click')
    await wrapper.find('input').setValue('123456')
    await wrapper.find('.codeSend').trigger('click')
    await flushPromises()
    await waitForExpect(() => {
      expect(spy).toBeCalledTimes(0)
      expect(wrapper.findAll('button').length).toEqual(2)
      expect(wrapper.findAll('button').at(0)?.text()).toBe('activate 2fa')
      expect(wrapper.findAll('button').at(1)?.text()).toBe('Send code')
      expect(wrapper.findAll('img').length).toEqual(1)
      // @ts-ignore
      expect(wrapper.vm.url).toBe(baseUrl + '/TestUrl')
      // @ts-ignore
      expect(wrapper.vm.error).toBe('the test works')
    })
  })

  it('sending an empty code, does nothing', async () => {
    mock.onGet(baseUrlauth + 'activate2FA').reply(200, { url: baseUrl + '/TestUrl' })
    mock.onPost(baseUrlauth + 'verifyactivate2fa').reply(403, { message: 'the test works' })
    const authStore = useAuthStore()
    authStore.$patch({ userProfile: { activated2FA: false } })
    const spy = vi.spyOn(authStore, 'activate2FA')

    await wrapper.find('.change2fa').trigger('click')
    await wrapper.find('.codeSend').trigger('click')
    await flushPromises()
    await waitForExpect(() => {
      expect(spy).toBeCalledTimes(0)
      expect(wrapper.findAll('button').length).toEqual(2)
      expect(wrapper.findAll('button').at(0)?.text()).toBe('activate 2fa')
      expect(wrapper.findAll('button').at(1)?.text()).toBe('Send code')
      expect(wrapper.findAll('img').length).toEqual(1)
      // @ts-ignore
      expect(wrapper.vm.url).toBe(baseUrl + '/TestUrl')
      // @ts-ignore
      expect(wrapper.vm.error).toBe(null)
    })
  })
})
