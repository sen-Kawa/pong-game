import { plainToClass } from 'class-transformer'
import { IsAlphanumeric, IsString, IsNumber, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsString()
  @IsString()
  DATABASE_URL: string
}

export function validate(configuration: Record<string, unknown>) {
  const finalConfig = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true
  })

  const errors = validateSync(finalConfig, { skipMissingProperties: true })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }

  return finalConfig
}
