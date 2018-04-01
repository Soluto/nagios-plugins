#Description
Check that a given container contains files that were updated in the last X days

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
- -d, --daysBack      Days back to check
- -w, --warningCount    Warning count
- -x, --criticalCount  Critical count
- -h, --help               display this help           

### Example
```
azure-blob-storage/index.js '-c' 'container-name' '-s' 'storage-account' '-t' '?sv=k2192jf90qjwfi0q' -p 'blob-name-prefix' -d '1' -x '1' -w '2'
```