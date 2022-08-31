## Introduction 
- Replication for new created buckets 
- Replication for existing objects 
- Batch operation introuction 


## 1. Replication for New Created Buckets 
```ts
const dest = new cdk.aws_s3.Bucket(
  this,
  "DestBucket",
  {
    bucketName: `dest-bucket-${this.account}`,
    versioned: true,
    removalPolicy: RemovalPolicy.DESTROY
  }
)
```

role for replication rule 
```tsx
const role = new cdk.aws_iam.Role(
  this,
  "RoleForReplicationTask",
  {
    roleName: "RoleForReplicationTask",
    assumedBy: new cdk.aws_iam.ServicePrincipal("s3.amazonaws.com"),
    inlinePolicies: {
      "AllowCopyData": new cdk.aws_iam.PolicyDocument({
        statements: [
          // my lazy role - check docs for least privildge
          new cdk.aws_iam.PolicyStatement({
            effect: Effect.ALLOW,
            resources: ["*"],
            actions: ["s3:*"]
          })
        ]
      })
    }
  }
)
```

source bucket 
```tsx
const source = new cdk.aws_s3.CfnBucket(
  this,
  "SourceBucket",
  {
    bucketName: `source-bucket-${this.account}`,
    versioningConfiguration: {
      status: "Enabled",
    },
    // replication configuration and rules 
    replicationConfiguration: {
      role: role.roleArn,
      rules: [
        {
          status: "Enabled",
          // prefix: "images/",
          destination: {
            bucket: dest.bucketArn
          }
        }
      ]
    }
  }
)
```


## 2. Replication for Existing Objects 
Need to create a batch job from aws console. Note to 
- Provide the correct roles for replication rule and batch job 
- It is good to choose create roles option so the role is automatically created 
