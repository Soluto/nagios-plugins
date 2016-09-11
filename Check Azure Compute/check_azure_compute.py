#!/usr/bin/python

# Inspired by MS Azure check_azure_compute Nagios plugin
# https://github.com/MSOpenTech/wamo


import argparse
import os
import sys
import azure
import logging
import collections
from azure.servicemanagement import ServiceManagementService
from azuremonitor.publishsettings import PublishSettings
class AzureService:

    def __init__(self, hostedServiceName, management):
        self.hostedServiceName = hostedServiceName
        self.management = management

    def getServiceDetails(self, deploymentSlot):
        self.service = self.management.get_hosted_service_properties(
            self.hostedServiceName,
            embed_detail=True)
        self.serviceStatus = self.service.hosted_service_properties.status
        self.deployment = self.management.get_deployment_by_slot(
            self.hostedServiceName, deploymentSlot)

def handle_args():
    """Create the parser, parse the args, and return them."""
    parser = argparse.ArgumentParser(description='Check Azure Compute',
                                     epilog='(c) MS Open Tech')
    parser.add_argument('hostname', help='hosted service to check')
    parser.add_argument(
        '-p', '--publish-settings',
        required=True,
        help='.publishsettings file to authenticate with azure',
        dest='psfile')
    parser.add_argument('-a', '--all', action='store_true',
                        help='check all hosted services, ignores hostname')
    parser.add_argument('-v', '--verbose', action='count', 
                        default=0, help='verbosity')
    parser.add_argument('--version', action='version', version='%(prog)s 0.1')
    return parser.parse_args()


def is_service_ok (hostedService):
    serviceOkStatus = ["Created"]
    deploymentOkStatus = ["Running", "RunningTransitioning"]
    instanceOkStatus = ["ReadyRole", "RoleStateUnknown"]
    if (hostedService.serviceStatus not in serviceOkStatus):
        print ('Service status: {0}'.format(hostedService.serviceStatus))
        return False
    if (hostedService.deployment.status not in deploymentOkStatus):
        print ('Deployment status: {0}'.format(hostedService.deployment.status))
        return False
    instancesStatus = collections.Counter()
    instanceCount = 0
    instancesInBadState = 0
    for instance in hostedService.deployment.role_instance_list:
        instancesStatus[instance.instance_status] += 1
        instanceCount += 1
        if (instance.instance_status not in instanceOkStatus):
            instancesInBadState += 1
    print('Total instances: {0}| instances.total={0}'.format(instanceCount))
    for key in instancesStatus:
        print('{0}: {1}|instances.{0}={1}'.format(str(key), instancesStatus[key]))
    if (instancesInBadState > instanceCount / 2):
        print('Total instances in bad state: {0}'.format(instancesInBadState))
        return False
    return True


def setup_logger(verbose):
    """Creates a logger, using the verbosity, and returns it."""
    logger = logging.getLogger()
    if verbose >= 3:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.WARNING)        
    logger.addHandler(logging.StreamHandler())
    return logger

def main():
    """Main procedure for Azure monitor utility."""

    args = handle_args()

    logger = setup_logger(args.verbose)
    logger.debug('Converting publishsettings.')
    try:
        publishsettings = PublishSettings(args.psfile)
    except Exception, error:
        print 'Publishsettings file is not good'
        print error
        sys.exit(1)
    pem_path = publishsettings.write_pem()
    logger.debug('Pem file saved to temp file {0}'.format(pem_path))
    logger.debug('Azure sub id {0}'.format(publishsettings.sub_id))

    management = ServiceManagementService(
        subscription_id=publishsettings.sub_id,
        cert_file=pem_path)
    service = AzureService(args.hostname, management)
    try:
        service.getServiceDetails("production")
    except azure.common.AzureMissingResourceHttpError, error:
        print ('Hosted service {0} not found'.format(args.hostname))
        sys.exit(2)

    logger.debug('Azure status retreived.')

    os.unlink(pem_path)
    logger.debug('Deleted pem.')

    if (is_service_ok(service)):
        sys.exit(0)
    else:
        sys.exit(2)

if __name__ == '__main__':
    main()