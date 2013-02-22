/**
* Appcelerator Titanium Mobile
* This is generated code. Do not modify. Your changes *will* be lost.
* Generated code is Copyright (c) 2009-2011 by Appcelerator, Inc.
* All Rights Reserved.
*/
#import <Foundation/Foundation.h>
#import "TiUtils.h"
#import "ApplicationDefaults.h"
 
@implementation ApplicationDefaults
  
+ (NSMutableDictionary*) copyDefaults
{
    NSMutableDictionary * _property = [[NSMutableDictionary alloc] init];

    [_property setObject:[TiUtils stringValue:@"19aHAYxpcc27D9ZyuwUxXTbqthoJuTyK"] forKey:@"acs-oauth-secret-production"];
    [_property setObject:[TiUtils stringValue:@"9ElE0cIjwG2RBur85n3QwNbplZuYQPsP"] forKey:@"acs-oauth-key-production"];
    [_property setObject:[TiUtils stringValue:@"RNtYTHO4bf7b4GC8lzEovXr1s43fPweU"] forKey:@"acs-api-key-production"];
    [_property setObject:[TiUtils stringValue:@"t7e7ZzcdAHTCb43pq7xpQLQgpUKtgp2P"] forKey:@"acs-oauth-secret-development"];
    [_property setObject:[TiUtils stringValue:@"s0My1xUvu2QUWxtU5eX4WNsZYwPg1Qzf"] forKey:@"acs-oauth-key-development"];
    [_property setObject:[TiUtils stringValue:@"KhYPGpISvdWirl3LjzWj1i4HP8nTelQ1"] forKey:@"acs-api-key-development"];
    [_property setObject:[TiUtils stringValue:@"system"] forKey:@"ti.ui.defaultunit"];

    return _property;
}
@end
