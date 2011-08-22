//- JavaScript source code

//- tests.js ~~
//
//  This defines regression tests for Quanah. I'm new to this, so be gentle ;-)
//
//                                                          ~~ SRW, 13 Nov 2010

//- NOTE: this assumes we are running the test from the developers' page.

load("q.js");
merge(q, this);

var sum, tripler, x, y, z;

sum = function (x) {
    return reduce(0, x).using(function (a, b) {
        return a + b;
    });
};

tripler = function (x) {
    return map(x).using(function (each) {
        return 3 * each;
    }); 
};

x = [1, 2, 3, 4, 5];

y = tripler(x);

z = sum(y);

print(x, y, z);

//- vim:set syntax=javascript:
