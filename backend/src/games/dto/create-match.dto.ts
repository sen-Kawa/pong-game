import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNumber, IsPositive } from 'class-validator'

export class CreateMatchDto {
  @ApiProperty({
    // type: [Number],
    description: 'List of players in the match identified by their id',
    example: [42, 69]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @IsInt({ each: true })
  @ArrayUnique()
  readonly playerIds: number[]

  // sideSelection?
  // spectators?
}
