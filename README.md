

## The `@Module()` decorator takes a single object with properties that describes the module:

- Providers: the providers that will be instantiated by Nest injector and that may be shared at least across
- Controllers: the set of controllers defined in this module which have to be instantiated
- Imports: the list of imported modules that export the providers which are required in this module
- Exports: the subset of providers that are provided by this module and should be available in other modules which import this module. You can use either the provider itself or just its token (provide value)


## Gurads / Pipes


## Dynamic Routes

```ts


import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}



```

```ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

```ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```


---

## Testing 

1- Watch testing section from John Smilga course then read the docs from nest.js 
2- https://docs.nestjs.com/fundamentals/testing
3- also my old code https://github.com/MohamedElsayed002/nestjs-testing


## Caching 

https://docs.nestjs.com/techniques/caching


## Cookies 

https://docs.nestjs.com/techniques/cookies


## Compression 


https://docs.nestjs.com/techniques/compression

Compression can greatly decrease size of the response body, threaby increasing the speed of web app.

For high-traffic websites in production, it is strongly recommended to offload compression from the application server-typically in a reverse proxy (e.g. Nginx). In that case, you should not use compression middleware