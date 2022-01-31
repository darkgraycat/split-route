# splitter_mw
Middleware that can split behavior in a single route

# start
1. clone
2. run `npm init`
3. run `npm start`
4. have fun (required)

# usage
Use your favorite tool to make requests.
There only 4 endpoints to test:

`GET/localhost:8088/one/:state` responses: (state>0) ? `CONTROLLER ONE [ep ONE: AB]` : `CONTROLLER ONE [ep ONE: CBA]`

`GET/localhost:8088/two/:state` responses: (state>0) ? `CONTROLLER TWO [ep TWO: CCA]` : `Error: Error A Data:ep TWO: A`

`GET/localhost:8088/both/:state` responses: (state>0) ? `CONTROLLER ONE [ep BOTH: AB]` : `CONTROLLER TWO [ep BOTH: BC]`

`GET/localhost:8088/complex/:state` responses: 

 if state==0 `CONTROLLER ONE [ep COMPLEX: CCC]`

 if state==1 `CONTROLLER ONE [ep COMPLEX: CBB]`

 if state==11 `CONTROLLER TWO [ep COMPLEX: CAA]` - and look at console - express tries to run controllerOne after sending response
                          
