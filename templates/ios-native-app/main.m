//- Objective-C source code

//- main.m ~~
//                                                      ~~ (c) SRW, 05 Apr 2012

#import <UIKit/UIKit.h>

int main(int argc, char* argv[]) {

    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];

    int exit_code = UIApplicationMain(argc, argv, nil, nil);

    [pool release];

    return exit_code;

}

//- vim:set syntax=objc:
