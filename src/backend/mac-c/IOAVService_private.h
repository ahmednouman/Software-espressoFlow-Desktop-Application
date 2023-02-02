//
//  IOAVService_private.h
//  flowlib
//
//  Created by Christopher Hook on 27/01/2022.
//

#ifndef IOAVService_private_h
#define IOAVService_private_h

#include <ApplicationServices/ApplicationServices.h>
#include <CoreFoundation/CoreFoundation.h>
#include <IOKit/IOKitlib.h>

extern CFTypeRef IOAVServiceCreate(CFAllocatorRef allocator);
extern CFTypeRef IOAVServiceCreateWithService(CFAllocatorRef allocator, io_service_t service);

extern IOReturn IOAVServiceReadI2C(CFTypeRef service, uint32_t w1, uint32_t w2, void* w3, uint32_t w4);
extern IOReturn IOAVServiceWriteI2C(CFTypeRef service, uint32_t w1, uint32_t w2, void* w3, uint32_t w4);

#endif /* IOAVService_private_h */
