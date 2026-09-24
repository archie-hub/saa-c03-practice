# Domain 1: Design Secure Architectures (30%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html>

---

## Task 1.1: Design secure access to AWS resources

**1.** A company just created a new AWS account. Which action should the solutions architect take FIRST to secure the root user?
- A. Create access keys for the root user and store them in AWS Secrets Manager
- B. Enable MFA on the root user and use an IAM Identity Center or IAM identity for daily tasks
- C. Delete the root user
- D. Attach the `AdministratorAccess` policy to the root user

<details><summary>Answer</summary>

**B.** The root user can't be deleted and already has full access. Best practice is to enable MFA, avoid creating root access keys, and use other identities for everyday work.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html>
</details>

**2.** An application on Amazon EC2 needs to read objects from one S3 bucket. What is the MOST secure way to grant access?
- A. Store an IAM user's access keys in the application configuration file
- B. Attach an IAM role with a least-privilege policy to the instance through an instance profile
- C. Make the bucket public and restrict it by IP address
- D. Put the root user's access keys in environment variables

<details><summary>Answer</summary>

**B.** Instance profiles deliver temporary, automatically rotated credentials to the instance.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html>
</details>

**3.** A company has 40 AWS accounts in AWS Organizations. Security wants to make sure that no account in the Sandbox OU can leave the organization or disable AWS CloudTrail, including account administrators. What should they use?
- A. IAM permissions boundaries in every account
- B. A service control policy (SCP) attached to the Sandbox OU
- C. An S3 bucket policy
- D. AWS Config rules with automatic remediation

<details><summary>Answer</summary>

**B.** SCPs set the maximum permissions for every principal in the member accounts under an OU, including administrators (but not the management account).
Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**4.** Which statement about service control policies is TRUE?
- A. SCPs grant permissions to IAM users
- B. SCPs affect the management account
- C. SCPs limit the maximum available permissions but do not grant any permissions
- D. SCPs replace IAM identity-based policies

<details><summary>Answer</summary>

**C.** An action is allowed only if both the SCP and an IAM policy allow it. SCPs never grant access and don't apply to the management account.
Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**5.** A company wants its employees to sign in to multiple AWS accounts using their existing corporate Microsoft Active Directory credentials and a single portal. Which service is the BEST fit?
- A. IAM users in each account with matching passwords
- B. AWS IAM Identity Center connected to AD (through AWS Directory Service or an external IdP)
- C. Amazon Cognito user pools
- D. AWS Secrets Manager

<details><summary>Answer</summary>

**B.** IAM Identity Center gives workforce users single sign-on across accounts in AWS Organizations and can use AD as the identity source.
Resource: <https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html>
</details>

**6.** A developer in Account A needs to manage DynamoDB tables in Account B. What is the recommended approach?
- A. Create an IAM user in Account B and share its credentials
- B. Create a role in Account B that trusts Account A, and allow the developer to call `sts:AssumeRole` on it
- C. Use an SCP to allow cross-account access
- D. Enable VPC peering between the accounts

<details><summary>Answer</summary>

**B.** Cross-account role delegation with temporary credentials from AWS STS.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html>
</details>

**7.** A company lets developers create IAM roles for their Lambda functions but must make sure those roles can never have more than a defined set of permissions. What should be used?
- A. IAM permissions boundaries
- B. Resource-based policies
- C. Session policies only
- D. IAM access analyzer

<details><summary>Answer</summary>

**A.** A permissions boundary sets the maximum permissions an identity-based policy can grant to an IAM entity. It's often required as a condition on `iam:CreateRole`.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html>
</details>

**8.** An IAM policy explicitly allows `s3:*` on a bucket, and an attached SCP explicitly denies `s3:DeleteObject`. What happens when the user tries to delete an object?
- A. Allowed, because the IAM policy is more specific
- B. Denied, because an explicit deny always overrides an allow
- C. Allowed, because SCPs don't apply to S3
- D. The result depends on the order the policies were attached in

<details><summary>Answer</summary>

**B.** In policy evaluation logic, an explicit deny in any applicable policy wins.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html>
</details>

**9.** A mobile app needs to let millions of end users sign up and sign in, and then give them temporary credentials to upload to their own S3 prefix. Which combination is correct?
- A. IAM users per customer
- B. Amazon Cognito user pools for authentication and Cognito identity pools for temporary AWS credentials
- C. IAM Identity Center
- D. AWS Directory Service Simple AD

<details><summary>Answer</summary>

**B.** User pools handle the user directory and tokens. Identity pools exchange those tokens for scoped STS credentials, for example using `${cognito-identity.amazonaws.com:sub}` in the policy.
Resource: <https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html>
</details>

**10.** Which tool helps identify resources such as S3 buckets or KMS keys that are shared with an external entity?
- A. AWS Trusted Advisor
- B. IAM Access Analyzer
- C. Amazon Inspector
- D. AWS Artifact

<details><summary>Answer</summary>

**B.** IAM Access Analyzer uses automated reasoning to find resource policies that give access to principals outside your zone of trust.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html>
</details>

**11.** A company wants to set up a multi-account environment with guardrails, centralized logging, and account vending that follows AWS best practices. Which service should be used?
- A. AWS Control Tower
- B. AWS Config
- C. AWS Service Catalog alone
- D. AWS Systems Manager

<details><summary>Answer</summary>

**A.** Control Tower sets up a landing zone on top of Organizations with preventive (SCP) and detective (Config) controls.
Resource: <https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html>
</details>

**12. (Select TWO.)** Which are AWS IAM best practices?
- A. Use temporary credentials through roles and federation instead of long-term access keys
- B. Share IAM users between team members to reduce the number of credentials
- C. Grant least privilege and refine it using access activity (last accessed information)
- D. Embed access keys in AMIs so that instances start faster
- E. Use the root user for billing and daily administration

<details><summary>Answer</summary>

**A, C.**
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
</details>

**13.** Security needs an audit trail of every API call made in all accounts of an organization, stored centrally and protected from tampering. What is the BEST solution?
- A. Enable VPC Flow Logs in each account
- B. Create an organization trail in AWS CloudTrail that delivers to a central S3 bucket, with log file validation and S3 Object Lock
- C. Use Amazon CloudWatch metrics
- D. Use AWS Config aggregators only

<details><summary>Answer</summary>

**B.** An organization trail records management events for every member account. Log file validation detects tampering, and Object Lock prevents deletion.
Resource: <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html>
</details>

---

## Task 1.2: Design secure workloads and applications

**14.** A public web application running behind an Application Load Balancer is being hit by SQL injection and cross-site scripting attempts. Which service mitigates this?
- A. AWS Shield Standard
- B. AWS WAF with managed rule groups associated with the ALB
- C. Network ACLs
- D. Amazon GuardDuty

<details><summary>Answer</summary>

**B.** AWS WAF inspects HTTP(S) requests at Layer 7. The AWS Managed Rules include SQLi and XSS rule sets.
Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html>
</details>

**15.** A company needs protection against large DDoS attacks, access to the AWS Shield Response Team (SRT), and cost protection for scaling charges during an attack. What should they choose?
- A. AWS Shield Standard
- B. AWS Shield Advanced
- C. AWS WAF only
- D. Amazon Inspector

<details><summary>Answer</summary>

**B.** Shield Advanced adds SRT access, enhanced detection, and DDoS cost protection. Shield Standard is free and automatic but offers none of these.
Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html>
</details>

**16.** What is the key difference between security groups and network ACLs?
- A. Security groups are stateless; NACLs are stateful
- B. Security groups are stateful and support allow rules only; NACLs are stateless and support both allow and deny rules
- C. NACLs apply to instances; security groups apply to subnets
- D. Both support deny rules

<details><summary>Answer</summary>

**B.** Security groups work at the ENI level and are stateful. NACLs work at the subnet level, are stateless, and evaluate numbered rules in order.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html>
</details>

**17.** A company must block a single malicious IP address from reaching every instance in a subnet. What is the simplest option?
- A. Add a deny rule to the security group
- B. Add a deny rule to the subnet's network ACL
- C. Remove the internet gateway
- D. Use an IAM policy with `aws:SourceIp`

<details><summary>Answer</summary>

**B.** Security groups can't deny traffic. A NACL deny rule (or AWS WAF, for web traffic) is the way to block it.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html>
</details>

**18.** Instances in a private subnet need to download OS patches from the internet without accepting inbound connections from it. What should be deployed?
- A. An internet gateway route in the private subnet
- B. A NAT gateway in a public subnet, with a route from the private subnet to it
- C. An Elastic IP on each instance
- D. A virtual private gateway

<details><summary>Answer</summary>

**B.** A NAT gateway allows outbound IPv4 traffic only. For IPv6, use an egress-only internet gateway.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html>
</details>

**19.** EC2 instances in private subnets need to access S3 without traffic going over the internet or through a NAT gateway. What is the MOST cost-effective option?
- A. An S3 gateway VPC endpoint
- B. An S3 interface endpoint (AWS PrivateLink)
- C. A VPN connection
- D. Direct Connect

<details><summary>Answer</summary>

**A.** Gateway endpoints (S3 and DynamoDB) are free and are added to route tables. Interface endpoints are charged per hour and per GB.
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html>
</details>

**20.** A company wants to expose an internal service in its VPC to hundreds of customer VPCs privately, without VPC peering and without overlapping-CIDR problems. What should be used?
- A. VPC peering with each customer
- B. AWS PrivateLink (an endpoint service behind a Network Load Balancer)
- C. Transit Gateway with public routing
- D. Internet-facing ALB

<details><summary>Answer</summary>

**B.** PrivateLink exposes a service one way through interface endpoints, and it works even when CIDRs overlap.
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html>
</details>

**21.** Which service continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs to detect threats such as cryptocurrency mining or compromised credentials?
- A. Amazon Macie
- B. Amazon GuardDuty
- C. Amazon Inspector
- D. AWS Audit Manager

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html>
</details>

**22.** Which service automatically scans EC2 instances, container images in ECR, and Lambda functions for software vulnerabilities (CVEs) and unintended network exposure?
- A. Amazon Inspector
- B. Amazon GuardDuty
- C. AWS Security Hub
- D. Amazon Detective

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html>
</details>

**23.** A security team wants one dashboard that aggregates findings from GuardDuty, Inspector, and Macie and checks accounts against the AWS Foundational Security Best Practices standard. Which service should they use?
- A. AWS Security Hub
- B. Amazon Detective
- C. AWS Trusted Advisor
- D. Amazon CloudWatch

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html>
</details>

**24.** An application stores a database password that must rotate automatically every 30 days. Which service is designed for this?
- A. AWS Systems Manager Parameter Store (standard parameter)
- B. AWS Secrets Manager with automatic rotation
- C. AWS KMS
- D. An S3 object encrypted with SSE-S3

<details><summary>Answer</summary>

**B.** Secrets Manager has built-in, Lambda-based rotation for RDS, Aurora, Redshift, and DocumentDB.
Resource: <https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html>
</details>

**25.** A three-tier application must be designed so that only the web tier is reachable from the internet and only the app tier can reach the database. What is the BEST design?
- A. Put all tiers in public subnets with NACLs
- B. Put the ALB in public subnets and the app and DB in private subnets, with security groups that reference each other (the DB SG allows only the app SG)
- C. Put the DB in a public subnet with a strong password
- D. Use a single security group for all tiers

<details><summary>Answer</summary>

**B.** Referencing security groups by ID keeps tiered access tight even as instances scale.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html>
</details>

**26.** An API built on Amazon API Gateway must authenticate users with JWTs issued by Amazon Cognito. What is the simplest option?
- A. A Cognito user pool authorizer on API Gateway
- B. IAM users per client
- C. A NACL rule
- D. AWS WAF rate-based rule

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html>
</details>

**27.** Administrators need shell access to private EC2 instances without opening port 22 or managing bastion hosts or SSH keys. What should be used?
- A. AWS Systems Manager Session Manager
- B. A bastion host in a public subnet
- C. An Elastic IP address
- D. EC2 Serial Console only

<details><summary>Answer</summary>

**A.** Session Manager uses the SSM agent and IAM, and it can log sessions to S3 or CloudWatch Logs.
Resource: <https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html>
</details>

**28.** A company needs to centrally manage firewall rules, including stateful inspection and domain filtering for outbound traffic, across many VPCs. Which service is the BEST fit?
- A. AWS Network Firewall, managed with AWS Firewall Manager
- B. Security groups
- C. Route 53 private hosted zones
- D. AWS Shield Standard

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html>
</details>

**29.** A company's on-premises data center needs an encrypted connection to a VPC that can be set up quickly over the internet. What should they use?
- A. AWS Site-to-Site VPN
- B. AWS Direct Connect without encryption
- C. VPC peering
- D. An internet gateway

<details><summary>Answer</summary>

**A.** Site-to-Site VPN uses IPsec tunnels and can be up in minutes. Direct Connect takes weeks to provision and isn't encrypted by default.
Resource: <https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html>
</details>

**30.** Only CloudFront should be able to read objects in a private S3 bucket that serves as a CloudFront origin. What should be configured?
- A. Origin access control (OAC) with a bucket policy that allows the CloudFront service principal
- B. Make the bucket public
- C. A pre-signed URL for every object
- D. S3 Transfer Acceleration

<details><summary>Answer</summary>

**A.** OAC replaces the legacy origin access identity (OAI).
Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
</details>

---

## Task 1.3: Determine appropriate data security controls

**31.** A company needs server-side encryption for S3 with an audit trail of key usage in CloudTrail and the ability to control who can use the key. Which option meets this requirement?
- A. SSE-S3
- B. SSE-KMS with a customer managed key
- C. SSE-C
- D. No encryption; use bucket policies

<details><summary>Answer</summary>

**B.** SSE-KMS logs key use in CloudTrail, and customer managed keys give you control through key policies and rotation.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html>
</details>

**32.** A bucket that uses SSE-KMS receives very high request rates, and KMS throttling costs are rising. What reduces calls to KMS?
- A. Enable S3 Bucket Keys
- B. Switch to SSE-C
- C. Disable versioning
- D. Use S3 Transfer Acceleration

<details><summary>Answer</summary>

**A.** A bucket-level key cuts KMS requests by up to 99%.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html>
</details>

**33.** Compliance requires that log objects can't be deleted or overwritten by anyone, including the root user, for 7 years. What should be used?
- A. S3 Versioning only
- B. S3 Object Lock in Compliance mode with a 7-year retention period
- C. S3 Object Lock in Governance mode
- D. MFA Delete only

<details><summary>Answer</summary>

**B.** In Compliance mode, no user can shorten the retention or delete the object. Governance mode can be bypassed by users with a special permission.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html>
</details>

**34.** An existing unencrypted Amazon RDS instance must be encrypted. How can this be done?
- A. Modify the instance and turn on encryption
- B. Take a snapshot, copy the snapshot with encryption enabled, and restore a new instance from the encrypted copy
- C. Enable encryption on the read replica
- D. Enable TLS

<details><summary>Answer</summary>

**B.** Encryption at rest can only be set when an RDS instance is created.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html>
</details>

**35.** Which service uses machine learning to discover and classify sensitive data such as PII in Amazon S3?
- A. Amazon Macie
- B. Amazon GuardDuty
- C. AWS Glue DataBrew
- D. Amazon Comprehend Medical

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html>
</details>

**36.** A company needs a public TLS certificate for its ALB and CloudFront distribution, with automatic renewal. What should be used?
- A. AWS Certificate Manager (ACM)
- B. AWS KMS
- C. A self-signed certificate uploaded to IAM
- D. AWS CloudHSM

<details><summary>Answer</summary>

**A.** ACM public certificates are free and renew automatically. CloudFront requires the certificate to be in us-east-1.
Resource: <https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html>
</details>

**37.** Regulations require single-tenant hardware security modules (FIPS 140-2 Level 3) under the customer's exclusive control. Which service fits?
- A. AWS KMS with AWS managed keys
- B. AWS CloudHSM
- C. AWS Secrets Manager
- D. SSE-S3

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html>
</details>

**38.** Every S3 request to a bucket must use HTTPS. How is this enforced?
- A. A bucket policy that denies requests where `aws:SecureTransport` is `false`
- B. Enable default encryption
- C. Enable S3 Block Public Access
- D. Use SSE-KMS

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>
</details>

**39.** A company wants to make sure no S3 bucket in the account can ever be made public, even by mistake. What should be enabled?
- A. S3 Block Public Access at the account level
- B. S3 Versioning
- C. Server access logging
- D. S3 Intelligent-Tiering

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html>
</details>

**40.** An encrypted EBS snapshot, encrypted with a customer managed KMS key, must be shared with another account. What is required?
- A. Share the snapshot and grant the other account permission to use the KMS key in the key policy
- B. Snapshots encrypted with any key can be shared without additional steps
- C. Make the snapshot public
- D. Copy the snapshot using the AWS managed key `aws/ebs`, then share it

<details><summary>Answer</summary>

**A.** Snapshots encrypted with the AWS managed key can't be shared. With a customer managed key, the target account also needs permission to use the key.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html>
</details>

**41.** A company needs automatic, cross-Region backups of EBS, RDS, DynamoDB, and EFS, with a central policy and vault lock to prevent deletion. Which service should they use?
- A. AWS Backup with backup plans, cross-Region copy, and AWS Backup Vault Lock
- B. Custom Lambda scripts
- C. S3 Cross-Region Replication
- D. AWS DataSync

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html>
</details>

**42.** How often does AWS KMS rotate a customer managed symmetric key when automatic rotation is enabled with default settings?
- A. Every 90 days
- B. Every year (365 days); the rotation period can be configured
- C. Never
- D. Every 30 days

<details><summary>Answer</summary>

**B.** Rotation defaults to every 365 days, and you can set a custom period between 90 and 2,560 days. Old key material is kept so existing data can still be decrypted.
Resource: <https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html>
</details>

**43.** Which service continuously evaluates resource configurations against rules, for example "all EBS volumes must be encrypted", and keeps configuration history?
- A. AWS Config
- B. AWS CloudTrail
- C. Amazon Inspector
- D. AWS Trusted Advisor

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html>
</details>

**44.** Where can a company download AWS compliance reports such as SOC and PCI reports for its auditors?
- A. AWS Artifact
- B. AWS Audit Manager
- C. AWS Config
- D. AWS Security Hub

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html>
</details>

**45. (Select TWO.)** Which options encrypt data in transit between clients and an application behind an ALB?
- A. An HTTPS listener with an ACM certificate on the ALB
- B. SSE-S3
- C. An HTTP-to-HTTPS redirect rule on the ALB
- D. EBS encryption
- E. KMS key rotation

<details><summary>Answer</summary>

**A, C.**
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html>
</details>
