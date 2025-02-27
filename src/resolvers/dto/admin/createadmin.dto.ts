/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAdminDto{

    @Field()
    name: string
    
    @Field()
    password: string
    
    @Field()
    email: string
    
    @Field()
    profile_image: string
}