//- JavaScript source code

//- reduce.js ~~
//                                                      ~~ (c) SRW, 12 Oct 2011

function (keys, values, rereduce) {
    if (rereduce) {
        return sum(values);
    } else {
        return values.length;
    }
}

//- vim:set syntax=javascript:
