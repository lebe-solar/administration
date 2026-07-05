targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Optional parameters to override the default azd resource naming conventions. Update the main.parameters.json file to provide values. e.g.,:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param apiServiceName string = ''
param appServicePlanName string = ''
param cosmosAccountName string = ''
param resourceGroupName string = ''
param storageAccountName string = ''
param webServiceName string = ''

@description('Id of the user or app to assign application roles')
param principalId string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }
var webUri = 'https://${web.outputs.defaultHostname}'

// Blob containers holding admin-uploaded files (spec PDFs, manufacturer logos, offer images).
// Public blob-level read so the site/admin can link straight to a blob URL without SAS tokens.
var uploadContainers = [
  { name: 'pdfs', publicAccess: 'Blob' }
  { name: 'logos', publicAccess: 'Blob' }
  { name: 'images', publicAccess: 'Blob' }
]

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// The application frontend
module web 'br/public:avm/res/web/static-site:0.3.0' = {
  name: 'staticweb'
  scope: rg
  params: {
    name: !empty(webServiceName) ? webServiceName : '${abbrs.webStaticSites}web-${resourceToken}'
    location: location
    provider: 'Custom'
    tags: union(tags, { 'azd-service-name': 'web' })
  }
}

// The application backend
module api './app/api-appservice-avm.bicep' = {
  name: 'api'
  scope: rg
  params: {
    name: !empty(apiServiceName) ? apiServiceName : '${abbrs.webSitesAppService}api-${resourceToken}'
    location: location
    tags: tags
    kind: 'functionapp'
    appServicePlanId: appServicePlan.outputs.resourceId
    appSettings: {
      API_ALLOW_ORIGINS: webUri
      AZURE_COSMOS_CONNECTION_STRING: cosmos.outputs.connectionString
      AZURE_COSMOS_DATABASE_NAME: cosmos.outputs.databaseName
      AZURE_STORAGE_ACCOUNT_NAME: storage.outputs.name
      AZURE_STORAGE_BLOB_ENDPOINT: storage.outputs.primaryBlobEndpoint
      FUNCTIONS_EXTENSION_VERSION: '~4'
      FUNCTIONS_WORKER_RUNTIME: 'node'
      SCM_DO_BUILD_DURING_DEPLOYMENT: true
    }
    siteConfig: {
      linuxFxVersion: 'node|20'
    }
    allowedOrigins: [ webUri ]
    storageAccountResourceId: storage.outputs.resourceId
    clientAffinityEnabled: false
  }
}

// The application database — Cosmos DB API for MongoDB, serverless (consumption-based) capacity.
module cosmos './app/db-avm.bicep' = {
  name: 'cosmos'
  scope: rg
  params: {
    accountName: !empty(cosmosAccountName) ? cosmosAccountName : '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    location: location
    tags: tags
  }
}

// Create an App Service Plan to group applications under the same payment plan and SKU
module appServicePlan 'br/public:avm/res/web/serverfarm:0.1.1' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    sku: {
      name: 'Y1'
      tier: 'Dynamic'
    }
    location: location
    tags: tags
    reserved: true
    kind: 'Linux'
  }
}

// Backing storage for the Azure Functions runtime, and blob containers for admin file uploads.
module storage 'br/public:avm/res/storage/storage-account:0.8.3' = {
  name: 'storage'
  scope: rg
  params: {
    name: !empty(storageAccountName) ? storageAccountName : '${abbrs.storageStorageAccounts}${resourceToken}'
    allowBlobPublicAccess: true
    dnsEndpointType: 'Standard'
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    blobServices: {
      containers: uploadContainers
    }
    location: location
    tags: tags
  }
}

// Grant the Function App's managed identity write access to the upload containers. Kept as
// its own module (rather than the storage module's own `roleAssignments` input) so it can
// depend on both `storage` and `api` without creating a module dependency cycle (api already
// depends on storage for AzureWebJobsStorage).
module storageRoleApi './app/storage-roles-avm.bicep' = {
  name: 'storage-role-api'
  scope: rg
  params: {
    storageAccountName: storage.outputs.name
    principalId: api.outputs.SERVICE_API_IDENTITY_PRINCIPAL_ID
    principalType: 'ServicePrincipal'
  }
}

// Grant the azd/local-dev principal (your `az login` user) the same access so uploads can be
// exercised against real Blob Storage from a local `func start` without a Function App identity.
module storageRolePrincipal './app/storage-roles-avm.bicep' = if (!empty(principalId)) {
  name: 'storage-role-principal'
  scope: rg
  params: {
    storageAccountName: storage.outputs.name
    principalId: principalId
    principalType: 'User'
  }
}

// App outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output API_BASE_URL string = api.outputs.SERVICE_API_URI
output REACT_APP_WEB_BASE_URL string = webUri
output AZURE_COSMOS_DATABASE_NAME string = cosmos.outputs.databaseName
output AZURE_STORAGE_ACCOUNT_NAME string = storage.outputs.name
output AZURE_STORAGE_BLOB_ENDPOINT string = storage.outputs.primaryBlobEndpoint
