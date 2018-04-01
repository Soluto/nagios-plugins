const azure = require('azure-storage');
const getOpt = require('node-getopt');
const moment = require('moment');

let NagiosPlugin = require('nagios-plugin');
let plugin = new NagiosPlugin({
    shortName: 'azure_blobs'
});

_opt = getOpt
.create([['s', 'storageAccount=<STRING>', 'Storage account name']
    , ['c', 'container=<STRING>', 'Container name']
    , ['t', 'token=<STRING>', 'SAS token with read access to the desired container']
    , ['p', 'filePrefix=<STRING>', 'File prefix']
    , ['d', 'daysBack=<STRING>', 'Days backs to search blobs']
    , ['w', 'warningCount=<NUMBER>', 'Warning count']
    , ['x', 'criticalCount=<NUMBER>', 'Critical count']
    , ['h', 'help', 'display this help']])
.bindHelp()
.setHelp('Usage: node index.js\n[[OPTIONS]]')

const args = _opt.parseSystem();

function verify_args(_args) {
    for (arg of _args) {
        if (!arg) {
            console.log(_opt.getHelp());
            process.exit(1);
        }
    }
}

verify_args([args.options.storageAccount, args.options.container, args.options.token, args.options.filePrefix, args.options.daysBack, args.options.criticalCount, args.options.warningCount])

const promsifiedListBlobsSegmentedWithPrefix = (blobService, container, filePrefix, continuationToken) => {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmentedWithPrefix(args.options.container, args.options.filePrefix, continuationToken, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result)
            }
        })
    })
}

async function run() {    
    var blobUri = 'https://' + args.options.storageAccount + '.blob.core.windows.net';
    let blobService = azure.createBlobServiceWithSas(blobUri, args.options.token);

    let entries = [];
    let first = true;
    let continuationToken;
    while (continuationToken || first) {
        first = false;
        let result = await promsifiedListBlobsSegmentedWithPrefix(blobService, args.options.container, args.options.filePrefix, continuationToken);
        entries = entries.concat(result.entries.filter(entry => moment(entry.lastModified) > moment().subtract(args.options.daysBack, 'd')));
        continuationToken = result.continuationToken;
    }      

    const alertOnMissingBlob = args.options.criticalCount < args.options.warningCount;
    const outputMessage = `Found *${entries.length}* blobs matching pattern that modified in the last *${args.options.daysBack}* days`;

    if (alertOnMissingBlob) {
        if (args.options.criticalCount >= entries.length) {
            plugin.nagiosExit(plugin.states.CRITICAL, outputMessage);
        } else if (args.options.warningCount >= entries.length) {
            plugin.nagiosExit(plugin.states.WARNING, outputMessage);
        }
    } else {
        if (args.options.criticalCount <= entries.length) {
            plugin.nagiosExit(plugin.states.CRITICAL, outputMessage);
        } else if (args.options.warningCount <= entries.length) {
            plugin.nagiosExit(plugin.states.WARNING, outputMessage);
        }
    }

    return entries.length;
}

run()
    .then(foundEntities => plugin.nagiosExit(plugin.states.OK, `Found ${foundEntities} matching blobs matching pattern`))
    .catch(err => plugin.nagiosExit(plugin.states.UNKNOWN, err));
