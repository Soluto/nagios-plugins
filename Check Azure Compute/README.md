# Introduction
This is a modified version of check_azure_compute.py plugin from https://github.com/MSOpenTech/wamo
The plugin checks whether an Azure Cloud Service is in a good state which means:

1. The deployment is "Running" or "RunningTransitioning"
2. At least half of the role instances are in a "ReadyRole" or "RoleStateUnknown" state.

# Prerequisites
* Python 2.7
* Download your Azure PublishSettings file and keep it in a safe place

## Usage
 ```
$ check_azure_compute.py %Azure Hosted Service Name% -p %path of Azure PublishSettings file%
```
      
### Example
```
'/usr/lib/nagios/plugins/check_azure_compute' 'MY_WEBROLE' '-p' '/etc/nagios/private/MYAZURE.publishsettings'
```
