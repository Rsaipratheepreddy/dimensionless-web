#!/bin/bash
export PATH=$PATH:/usr/bin:/usr/local/bin
cd /var/app/staging
npm install --omit=dev
