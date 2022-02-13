# split-route
Express middleware builder that can split behavior in single route

# example
```js
router.get('/',
  middlewareA,
  middlewareB,
  splitRoute(req => req.get('type'))
    .case('typeC', middlewareC1, middlewareC2)
    .case('typeD', middlewareD1, middlewareD2)
    .default(middlewareE)
    .end(),
  middlewareF,
  controller
)
```
Route above has 3 different behaviors depending on header value passed:
1. **type=typeC** middlewares called: `A B C1 C2 F`
2. **type=typeD** middlewares called: `A B D1 D2 F`
3. **type=something** middlewares called: `A B E F`

*Please look at [`tests/index.test.js`](https://github.com/darkgraycat/split-route/blob/main/tests/index.test.js) for more examples*
 
