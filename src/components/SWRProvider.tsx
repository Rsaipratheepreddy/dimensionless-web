'use client';
import { SWRConfig } from 'swr';
import React from 'react';

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SWRConfig
            value={{
                fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
                revalidateOnFocus: false,
                revalidateIfStale: true,
                dedupingInterval: 5000, // 5 seconds
            }}
        >
            {children}
        </SWRConfig>
    );
};
