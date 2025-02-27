/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
    @Field()
    id: string;
    
    @Field()
    email: string;

    @Field()
    name: string;

    @Field({nullable: true})
    picture?: string;

    @Field()
    access_token: string;
    
    @Field()
    refresh_token: string;
}
