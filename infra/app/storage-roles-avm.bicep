@description('Name of an existing storage account in this resource group.')
param storageAccountName string

@description('Principal to grant blob read/write access to (a Function App managed identity, or a local-dev user/service principal).')
param principalId string

@description('Type of the principal being granted access.')
param principalType string = 'ServicePrincipal'

// Built-in role definition ID for "Storage Blob Data Contributor"
var storageBlobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource storageBlobRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, principalId, storageBlobDataContributorRoleId)
  scope: storageAccount
  properties: {
    principalId: principalId
    principalType: principalType
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleId)
  }
}
