import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Effect } from 'aws-cdk-lib/aws-iam';

export class S3ReplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // destination bucket 
    const dest = new cdk.aws_s3.Bucket(
      this,
      "DestBucket",
      {
        bucketName: `dest-bucket-${this.account}`,
        versioned: true,
        removalPolicy: RemovalPolicy.DESTROY
      }
    )

    // role for replication rule 
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

    // source bucket 
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

    // remove bucket when destroy stack provided that bucket empty
    source.applyRemovalPolicy(RemovalPolicy.DESTROY)
  }
}
