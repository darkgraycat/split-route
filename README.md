# split-route
### _Express middleware builder that can split behavior in single route_

<hr/> 
<br/>

# Install
```bash
npm install split-route
```

# Usage

### Simple calculator app
```js
const app = require('express')();
const splitRoute = require('split-route');

app.use('/:a/:operator/:b', 
  
  // middleware that inits state
  (req, res, next) => { res.state = req.params.a; next(); },

  // call builder with callback that returns 'operator' param
  splitRoute((req, res) => req.params.operator)
    // if operator == plus
    .case('plus', (req, res, next) => { res.state += req.params.b; next(); })
    // if operator == minus
    .case('minus', (req, res, next) => { res.state -= req.params.b; next(); })
    // if operator != plus && operator != minus
    .default((req, res, next) => { console.warn('invalid operator'); next(); })
    // return builded middleware
    .end(),
  
  // simple controller
  (req, res) => { res.send(res.state) }
);
```

### Splitter inside splitter
```js
app.use('/',
  // ...
  splitRoute(cb) // 'cb' may return a, b or c
    .case('a', middlewareA1, middlewareA2)
    .case('b', middlewareB1, middlewareB2)
    .case('c', splitRoute(cb) // 'cb' may return 1 or 2
      .case(1, middlewareC1)
      .case(2, middlewareC2)
      .default(middlewareC0).end()
    ).end()
  //...
  controller
);
```
