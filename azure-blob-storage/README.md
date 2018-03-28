# Prerequisites
You  should have Node.js > 7.8 installed.

## Installation
```sh
$ npm install
```

## Usage
 ```sh
$ node app.js [Options] -- <api_key> <api_secret> <funnel_id>
```

### Options
- -c, --container=STRING  The name of the azure container
- -s, --storageAccount=STRING   The name of the storage account
- -t, --token=STRING  SAS token
- -p, --filePrefix=STRING   Blobs prefix
- -d, --daysBack      Search for blobs that modified in the last X days
- -h, --help               display this help           

### Example
```
azure-blob-storage/index.js '-c' 'container-name' '-s' 'storage-account' '-t' '?sv=k2192jf90qjwfi0q' -p 'daily-backup' -d '1'
```


['s', 'storageAccount=<STRING>', 'Storage account name']
    , ['c', 'container=<STRING>', 'Container name']
    , ['t', 'token=<STRING>', 'SAS token with read access to the desired container']
    , ['p', 'filePrefix=<STRING>', 'File prefix']
    , ['d', 'daysBack=<STRING>', 'Days backs to search blobs']
    , ['h', 'help', 'display this help']])