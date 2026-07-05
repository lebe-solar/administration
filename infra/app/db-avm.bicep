param accountName string
param location string = resourceGroup().location
param tags object = {}
param cosmosDatabaseName string = ''

// Each collection is its own shard (partition key `_id`) — appropriate at this catalog's
// scale (dozens to low hundreds of documents per collection) and avoids hot partitions
// without needing a bespoke partition key per entity.
//
// The wildcard index (`$**`) is required: Cosmos DB's Mongo API only automatically indexes
// every field when no custom `indexes` are supplied. As soon as you specify `indexes`
// yourself, that list becomes the *entire* indexing policy — omitting the wildcard here
// would silently restrict indexing to `_id` only, breaking any query that sorts or filters
// on another field (which is every list endpoint in this app).
param collections array = [
  {
    name: 'Products'
    indexes: [ { key: { keys: [ '_id' ] } }, { key: { keys: [ '$**' ] } } ]
    shardKey: { keys: [ '_id' ] }
  }
  {
    name: 'Manufacturers'
    indexes: [ { key: { keys: [ '_id' ] } }, { key: { keys: [ '$**' ] } } ]
    shardKey: { keys: [ '_id' ] }
  }
  {
    name: 'Offers'
    indexes: [ { key: { keys: [ '_id' ] } }, { key: { keys: [ '$**' ] } } ]
    shardKey: { keys: [ '_id' ] }
  }
  {
    name: 'OfferComponents'
    indexes: [ { key: { keys: [ '_id' ] } }, { key: { keys: [ '$**' ] } } ]
    shardKey: { keys: [ '_id' ] }
  }
]

var defaultDatabaseName = 'LeBeAdmin'
var actualDatabaseName = !empty(cosmosDatabaseName) ? cosmosDatabaseName : defaultDatabaseName

module cosmos 'br/public:avm/res/document-db/database-account:0.6.0' = {
  name: 'cosmos-mongo'
  params: {
    name: accountName
    location: location
    tags: tags
    // Mongo API for Cosmos DB only supports key-based (local) auth over the wire protocol —
    // Azure AD auth is not available for MongoDB-protocol connections, so this cannot be true.
    disableLocalAuth: false
    // Serverless: pay per request instead of provisioning RU/s — fits a low, spiky-traffic
    // internal admin tool much better than provisioned throughput.
    capabilitiesToAdd: [ 'EnableServerless' ]
    locations: [
      {
        failoverPriority: 0
        isZoneRedundant: false
        locationName: location
      }
    ]
    mongodbDatabases: [
      {
        name: actualDatabaseName
        tags: tags
        collections: collections
      }
    ]
  }
}

// Resolved in the same (resource group) deployment scope as the account itself, so the
// connection string can be handed to the API as a plain app setting without Key Vault.
// Uses the `accountName` param (known at the start of deployment) rather than the module's
// `.outputs.name` (a runtime value), which `listConnectionStrings()` cannot be evaluated against.
resource cosmosAccountExisting 'Microsoft.DocumentDB/databaseAccounts@2024-08-15' existing = {
  name: accountName
  dependsOn: [ cosmos ]
}

output accountName string = cosmos.outputs.name
output databaseName string = actualDatabaseName
output endpoint string = cosmos.outputs.endpoint
#disable-next-line outputs-should-not-contain-secrets
output connectionString string = cosmosAccountExisting.listConnectionStrings().connectionStrings[0].connectionString
