/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto{

    @Field()
    name: string
    
    @Field()
    password: string
    
    @Field()
    email: string
    
    @Field({nullable: true})
    profile_image?: string
}