# Domain 1: Design Secure Architectures (30%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html>

---

## Task 1.1: Design secure access to AWS resources

**1.** A three-person startup just created its first AWS account using the founder's personal credit card, and has already set a $50 monthly budget alert in AWS Budgets. The founder wants to bring on a contractor next week to help configure billing alarms. Before doing anything else, what should the founder do FIRST to secure the account?
- A. Attach a permissions boundary to the root user that limits it to billing actions
- B. Create access keys for the root user and store them in AWS Secrets Manager for emergencies
- C. Create an IAM user with the `AdministratorAccess` policy, then delete the root user's password so it can never sign in again
- D. Enable MFA on the root user and use IAM Identity Center or IAM identities for daily tasks

<details><summary>Answer</summary>

**D.** The root user can't be deleted or have its password permanently removed, and it already has full access. Best practice is to enable MFA, avoid creating root access keys, and use other identities for everyday work.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html>
</details>

**2.** A retail company runs a nightly reporting job on a single Amazon EC2 instance in `us-west-2`. The job already streams its logs to CloudWatch Logs and needs read-only access to objects in one S3 bucket that holds the previous day's sales exports. A former intern hard-coded an IAM user's access keys into the job's configuration file, and the security team wants that fixed. What is the MOST secure way to grant the instance access to the bucket?
- A. Add a bucket policy that allows anonymous reads from the instance's Elastic IP address
- B. Move the IAM user's access keys into AWS Secrets Manager and have the job retrieve them at startup
- C. Attach an IAM role with a least-privilege policy to the instance through an instance profile
- D. Rotate the IAM user's access keys automatically every 24 hours using a scheduled Lambda function

<details><summary>Answer</summary>

**C.** Instance profiles deliver temporary, automatically rotated credentials to the instance, removing the need for any long-term access keys at all.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html>
</details>

**3.** A company runs 40 AWS accounts across four organizational units in AWS Organizations. The 12 developer accounts in the Sandbox OU are also subject to a separate AWS Budgets alert that emails the finance team once spending passes $500 a month. After a Sandbox account administrator disabled AWS CloudTrail during a demo, the security team wants a guardrail that makes it impossible for anyone in the Sandbox OU — including account administrators — to disable CloudTrail or leave the organization, without touching each account individually. What should they use?
- A. AWS Config rules with automatic remediation that turn CloudTrail back on
- B. A service control policy (SCP) attached to the Sandbox OU
- C. IAM permissions boundaries attached to every user and role in the Sandbox accounts
- D. A budget action in AWS Budgets that stops EC2 and RDS resources once the threshold is hit

<details><summary>Answer</summary>

**B.** SCPs set the maximum permissions for every principal in the member accounts under an OU, including administrators (but not the management account), so a well-written deny SCP can block both actions everywhere in the OU at once.
Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**4.** A new cloud engineer on the security team is drafting internal documentation about service control policies (SCPs) ahead of a quarterly audit, and wants to state the rules correctly. Which statement about SCPs is TRUE?
- A. SCPs limit the maximum available permissions but do not grant any permissions
- B. SCPs grant permissions to the IAM users and roles in the accounts they're attached to
- C. SCPs replace the IAM identity-based policies in the accounts they're attached to
- D. SCPs restrict every principal in the organization, including the management account

<details><summary>Answer</summary>

**A.** An action is allowed only if both the SCP and an IAM policy allow it. SCPs never grant access on their own and don't apply to the management account.
Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**5.** A 3,000-employee company has an on-premises Microsoft Active Directory domain and 15 AWS accounts under AWS Organizations. The helpdesk currently resets around 200 forgotten passwords a month across various systems, and leadership wants employees to sign in to any of the 15 AWS accounts from a single portal using their existing corporate AD credentials, without AWS ever storing a separate copy of those passwords. Which service is the BEST fit?
- A. Amazon Cognito user pools federated with AD, with one app client per AWS account
- B. AWS Secrets Manager, storing a copy of each employee's AD password for every account
- C. IAM users in each account, with passwords kept in sync with AD by a scheduled script
- D. AWS IAM Identity Center, using AD as the identity source

<details><summary>Answer</summary>

**D.** IAM Identity Center (connected to AD through AWS Directory Service or an external IdP) gives workforce users single sign-on across accounts in AWS Organizations and can use AD as the identity source, without duplicating passwords.
Resource: <https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html>
</details>

**6.** Account A (Engineering) and Account B (Data) belong to the same AWS Organization and are already linked by a site-to-site VPN that the network team set up for an unrelated project. A developer who normally works in Account A now needs temporary, auditable access to manage DynamoDB tables in Account B for a two-week migration, after which access should stop automatically. What is the recommended approach?
- A. Create an IAM user in Account B and share its access keys with the developer for the migration
- B. Create a role in Account B that trusts Account A, and let the developer assume it
- C. Attach an SCP to Account B that allows the developer's IAM user from Account A
- D. Route the request through the existing VPN and reach DynamoDB in Account B over a private IP

<details><summary>Answer</summary>

**B.** Cross-account role delegation hands out short-lived credentials from AWS STS, is fully logged in CloudTrail, and can simply not be renewed once the migration ends — no keys to revoke.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html>
</details>

**7.** A platform team lets developers self-service the creation of IAM roles for their own Lambda functions through an internal Service Catalog product, so they no longer file infrastructure tickets. Security requires that no matter what policy a developer attaches to a new role, the role's effective permissions can never exceed a fixed, pre-approved set. What should be used to enforce this cap?
- A. IAM permissions boundaries
- B. AWS Firewall Manager
- C. Resource-based policies
- D. Session policies only

<details><summary>Answer</summary>

**A.** A permissions boundary sets the maximum permissions an identity-based policy can grant to an IAM entity. It's often required as a condition on `iam:CreateRole` so self-service role creation can't exceed it.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html>
</details>

**8.** A finance analyst's IAM user belongs to a group whose policy explicitly allows `s3:*` on the `finance-reports` bucket. The analyst's account also sits under an OU with an SCP, added last month after an accidental-deletion incident, that explicitly denies `s3:DeleteObject` for every principal. The analyst, unaware the SCP exists, tries to delete a report object from the console. What happens?
- A. Denied, because an explicit deny in any applicable policy always overrides an allow
- B. Allowed, because SCPs don't apply to S3 actions
- C. Allowed, because the IAM group policy is more specific than the SCP
- D. The result depends on which policy was attached first

<details><summary>Answer</summary>

**A.** In policy evaluation logic, an explicit deny in any applicable policy — including an SCP — always wins over an allow elsewhere.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html>
</details>

**9.** A photo-sharing mobile app expects 5 million registered users within its first year. Push notifications already go out through Amazon SNS mobile push, and marketing wants a referral program built around user IDs later. Separately, engineering needs users to be able to sign up and sign in, and then receive temporary AWS credentials scoped so each user can upload only to their own prefix in one shared S3 bucket. Which combination is correct?
- A. An IAM user for each customer, created at sign-up by a Lambda function
- B. Cognito user pools for sign-in and Cognito identity pools for AWS credentials
- C. IAM Identity Center, with each customer added as a workforce user
- D. AWS Directory Service Simple AD, with a group for each customer's S3 prefix

<details><summary>Answer</summary>

**B.** User pools handle the user directory and tokens. Identity pools exchange those tokens for scoped STS credentials, for example using `${cognito-identity.amazonaws.com:sub}` in the policy, which scales to millions of users far better than per-user IAM identities.
Resource: <https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html>
</details>

**10.** A company already relies on AWS Trusted Advisor's weekly cost checks to flag idle EC2 instances. After a contractor accidentally shared a KMS key with an external AWS account, the security team wants an automated, ongoing way to find any S3 bucket, KMS key, IAM role, or Lambda function whose resource policy grants access to a principal outside the company's AWS Organization. Which tool should they turn to?
- A. Amazon Inspector
- B. IAM Access Analyzer
- C. AWS Artifact
- D. AWS Audit Manager

<details><summary>Answer</summary>

**B.** IAM Access Analyzer uses automated reasoning to find resource policies that grant access to principals outside your defined zone of trust.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html>
</details>

**11.** A company plans to onboard around 10 new AWS accounts per quarter for new product teams. It wants every new account to start with a consistent baseline of preventive guardrails (SCPs), detective guardrails, and centralized logging, provisioned automatically — the manual checklist that currently takes two engineers a full day per account isn't scaling. Which service should be used?
- A. AWS Control Tower
- B. AWS Systems Manager
- C. AWS Service Catalog alone
- D. AWS Config

<details><summary>Answer</summary>

**A.** Control Tower sets up a landing zone on top of Organizations with preventive (SCP) and detective (Config) controls, and automates account vending through Account Factory.
Resource: <https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html>
</details>

**12. (Select TWO.)** A security audit produced a list of proposed IAM practices for the company to adopt. Which TWO should actually be adopted?
- A. Share one IAM user among the on-call rotation so pager alerts always come from the same identity
- B. Grant least privilege from the start, and refine it later using IAM Access Analyzer's last-accessed information
- C. Bake long-term access keys into a golden AMI so new instances start with working credentials immediately
- D. Reserve the root user for billing tasks, since ordinary IAM users can't be given access to the Billing console
- E. Use temporary credentials from roles and federation instead of creating long-term access keys wherever possible

<details><summary>Answer</summary>

**B, E.** IAM users and roles can be granted billing permissions directly, so the root user doesn't need to be reserved for billing, and shared credentials or embedded keys work against least privilege and auditability.
Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
</details>

**13.** During a compliance review, auditors ask the security team to produce every API call made by any principal in any of the company's 40 AWS accounts over the past 18 months, and to prove the records haven't been altered. Today, each account has its own local CloudTrail trail, and log files are kept only in each account's default Region. What is the BEST solution going forward?
- A. Create an organization trail in CloudTrail that delivers to a central S3 bucket with Object Lock
- B. Enable VPC Flow Logs in each account and send them to a central CloudWatch Logs group
- C. Use an AWS Config aggregator in the management account to collect configuration history
- D. Create a CloudWatch metric filter in each account and a cross-account dashboard of API calls

<details><summary>Answer</summary>

**A.** An organization trail records management events for every member account into one place. Log file validation detects tampering, and Object Lock on the destination bucket prevents deletion or modification.
Resource: <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html>
</details>

---

## Task 1.2: Design secure workloads and applications

**14.** A retailer's public web application runs behind an Application Load Balancer and is about to be featured in a national TV ad that marketing expects will triple traffic for one weekend. Separately, the security team's WAF logs show a rising number of requests containing SQL injection and cross-site scripting payloads aimed at the login page. Which service should be used to mitigate these application-layer attacks?
- A. AWS WAF with managed rule groups associated with the ALB
- B. AWS Shield Standard, which protects the ALB automatically
- C. Amazon GuardDuty, with findings sent to Amazon EventBridge
- D. Network ACL rules that block the attackers' source addresses

<details><summary>Answer</summary>

**A.** AWS WAF inspects HTTP(S) requests at Layer 7. AWS Managed Rules include SQLi and XSS rule sets that can be attached to the ALB in minutes.
Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html>
</details>

**15.** An online gaming company was hit by a 300 Gbps UDP reflection attack last month that also drove EC2 Auto Scaling costs up as the fleet scaled out to absorb the flood of traffic. For future attacks, the company wants a direct line to AWS's DDoS Response Team, more advanced attack diagnostics, and reimbursement for the scaling charges the attack caused. What should they choose?
- A. AWS WAF alone
- B. AWS Shield Advanced
- C. Amazon Inspector
- D. AWS Shield Standard

<details><summary>Answer</summary>

**B.** Shield Advanced adds Shield Response Team (SRT) access, enhanced detection, and DDoS cost protection for scaling charges. Shield Standard is free and automatic but offers none of these.
Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html>
</details>

**16.** A junior engineer adds a deny rule for a malicious IP address to a subnet's network ACL, and is confused why the team can't just achieve the same block by editing a security group instead. Which statement correctly explains the key difference between security groups and network ACLs here?
- A. Security groups are stateful and allow-only; NACLs are stateless and support deny rules
- B. Security groups apply to subnets; NACLs apply to each instance's network interface
- C. Security groups are stateless and support deny rules; NACLs are stateful and allow-only
- D. Both are stateful, but only NACLs evaluate numbered rules in order and support deny rules

<details><summary>Answer</summary>

**A.** Security groups work at the ENI level, are stateful, and can only allow traffic. NACLs work at the subnet level, are stateless, and evaluate numbered rules — including deny rules — in order.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html>
</details>

**17.** A subnet hosts 25 EC2 instances behind an internal load balancer, each with its own security group tailored to its application. The SOC identifies a single external IP address running automated credential-stuffing attempts against every instance in the subnet, and wants to block that one address from reaching any of them without editing 25 separate security groups. What is the simplest option?
- A. Detach the internet gateway from the VPC until the attack stops
- B. Attach an IAM policy that denies requests from that `aws:SourceIp`
- C. Add a deny rule for the address to the subnet's network ACL
- D. Add a deny rule for the address to each instance's security group

<details><summary>Answer</summary>

**C.** Security groups can't deny traffic. A single NACL deny rule on the subnet (or an AWS WAF rule, for HTTP/S traffic) blocks the address for every instance at once.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html>
</details>

**18.** A fleet of 50 EC2 instances in a private subnet is managed with AWS Systems Manager Patch Manager on a monthly maintenance window. The instances need to reach the internet to download OS patches and package-repository metadata, but security policy forbids any inbound connection from the internet to these instances. What should be deployed?
- A. An Elastic IP address attached to each instance in the private subnet
- B. A virtual private gateway attached to the VPC, with route propagation enabled
- C. A route from the private subnet directly to the internet gateway
- D. A NAT gateway in a public subnet, with a route from the private subnet to it

<details><summary>Answer</summary>

**D.** A NAT gateway lets instances in a private subnet initiate outbound IPv4 traffic while blocking unsolicited inbound connections from the internet. (For IPv6, use an egress-only internet gateway instead.)
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html>
</details>

**19.** A data-processing fleet of 200 EC2 instances in private subnets reads and writes several terabytes a day to Amazon S3. Traffic currently flows through a NAT gateway, and the monthly NAT data-processing charge has become the single largest line item on the bill. The instances don't need to reach any other AWS service privately right now. What is the MOST cost-effective way to remove this traffic from the NAT gateway?
- A. AWS Direct Connect
- B. A Site-to-Site VPN connection
- C. An S3 interface endpoint (AWS PrivateLink)
- D. An S3 gateway VPC endpoint

<details><summary>Answer</summary>

**D.** Gateway endpoints (for S3 and DynamoDB) are free and are added to route tables, eliminating the NAT data-processing charge for that traffic. Interface endpoints work too, but are billed per hour and per GB.
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html>
</details>

**20.** A SaaS company runs an internal pricing API in its VPC and wants to expose it privately to 300 customer VPCs across separate AWS accounts. Several of those customer VPCs, after past mergers and acquisitions, happen to use the exact same `10.0.0.0/16` CIDR block as each other. The company also doesn't want customers to see or route to anything else in its VPC. What should be used?
- A. AWS PrivateLink: an endpoint service behind a Network Load Balancer
- B. A transit gateway shared with each customer's account through AWS RAM
- C. An internet-facing ALB, restricted to customer IP ranges by a security group
- D. A VPC peering connection with each customer VPC, plus route table entries

<details><summary>Answer</summary>

**A.** PrivateLink exposes a service in one direction through interface endpoints and works even when the customer CIDRs overlap with each other or with the provider's VPC — something VPC peering and transit gateway attachments can't do.
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html>
</details>

**21.** After a security review, a company enables VPC Flow Logs, CloudTrail management and data events, and Route 53 Resolver query logging across every account. It now wants a managed service that continuously analyzes all of these logs together, without any additional infrastructure to run, to detect threats such as cryptocurrency mining, command-and-control traffic, or compromised IAM credentials. Which service fits?
- A. Amazon Macie
- B. Amazon GuardDuty
- C. AWS Audit Manager
- D. Amazon Inspector

<details><summary>Answer</summary>

**B.** GuardDuty continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs (among other sources) using threat intelligence and machine learning, with nothing for the customer to deploy or manage.
Resource: <https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html>
</details>

**22.** A company pushes new container images to Amazon ECR several times a day and also runs dozens of Lambda functions built on shared open-source layers. After a recent CVE affected a popular logging library, leadership wants automatic, ongoing scanning of EC2 instances, ECR images, and Lambda functions for known software vulnerabilities and unintended network exposure, without an engineer manually running a scanner. Which service should they use?
- A. Amazon Inspector
- B. Amazon Detective
- C. AWS Security Hub
- D. Amazon GuardDuty

<details><summary>Answer</summary>

**A.** Amazon Inspector automatically and continually scans EC2 instances, container images in ECR, and Lambda functions for known vulnerabilities (CVEs) and network reachability issues.
Resource: <https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html>
</details>

**23.** A security team already receives separate findings from GuardDuty, Inspector, and Macie in three different consoles, and manually cross-references them during incident investigations using Amazon Detective. They now want one dashboard that aggregates all of those findings, adds its own checks against standards like the AWS Foundational Security Best Practices, and gives each account an overall security score. Which service should they add?
- A. AWS Trusted Advisor
- B. Amazon CloudWatch
- C. Amazon Detective
- D. AWS Security Hub

<details><summary>Answer</summary>

**D.** Security Hub aggregates findings from GuardDuty, Inspector, Macie, and other sources, runs its own automated checks against security standards, and produces an overall score per account. Detective is used for deep investigation, not aggregation or scoring.
Resource: <https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html>
</details>

**24.** An application already stores non-secret configuration — feature flags, log levels — in AWS Systems Manager Parameter Store standard parameters. It also connects to an Amazon RDS for MySQL database using a password that security wants rotated automatically every 30 days, with the rotation Lambda function and new credentials managed on the company's behalf rather than hand-rolled. Which service is designed for this?
- A. AWS Systems Manager Parameter Store (standard parameter)
- B. AWS KMS with automatic key rotation enabled
- C. AWS Secrets Manager with automatic rotation
- D. An S3 object encrypted with SSE-S3

<details><summary>Answer</summary>

**C.** Secrets Manager has built-in, Lambda-based rotation for RDS, Aurora, Redshift, and DocumentDB, so the team doesn't have to build the rotation logic itself.
Resource: <https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html>
</details>

**25.** A three-tier application (web, app, database) is being redesigned after a penetration test found the database directly reachable from the internet through a misconfigured route table. The web tier serves a few thousand requests per minute through an ALB, and the app tier talks to the database only on port 3306. The redesign must ensure only the web tier is reachable from the internet, and only the app tier can reach the database. What is the BEST design?
- A. ALB in public subnets, app and DB in private subnets, DB security group allowing only the app tier's security group
- B. Put all tiers in private subnets and attach one security group shared by every tier
- C. Put the database in a public subnet and protect it with a strong password and TLS
- D. Put all three tiers in public subnets and restrict traffic between them with network ACLs

<details><summary>Answer</summary>

**A.** Referencing security groups by ID (rather than IP ranges) keeps access tightly scoped tier-to-tier even as instances scale in and out, and keeping the app and database tiers out of public subnets removes them from direct internet reachability.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html>
</details>

**26.** A mobile app's backend API on Amazon API Gateway currently has no authentication, which a pre-launch security review flagged. Users already sign in through an existing Amazon Cognito user pool that issues JWTs, and the mobile team doesn't want to implement SigV4 request signing inside the app. What is the simplest way to require a valid token on each API call?
- A. An IAM user for each client, with SigV4-signed requests
- B. A Cognito user pool authorizer on the API methods
- C. A network ACL that allows only the clients' IP addresses
- D. An AWS WAF rate-based rule attached to the API stage

<details><summary>Answer</summary>

**B.** A Cognito user pool authorizer validates the JWT on each request without requiring SigV4 signing or IAM credentials in the mobile app.
Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html>
</details>

**27.** A company's administrators currently SSH into a bastion host in a public subnet, then hop to private EC2 instances, and just spent hours rotating SSH keys after an admin left the team. Security wants shell access to the private instances without opening port 22 anywhere, without managing SSH keys, and with every session logged for audit. What should be used?
- A. AWS Systems Manager Session Manager
- B. An Elastic IP address on each private instance
- C. EC2 Serial Console only
- D. A second, more tightly locked-down bastion host in a public subnet

<details><summary>Answer</summary>

**A.** Session Manager uses the SSM agent and IAM policies instead of SSH keys or open inbound ports, and it can log session activity to S3 or CloudWatch Logs for audit.
Resource: <https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html>
</details>

**28.** A company manages 30 VPCs across 8 accounts and wants one central team to define firewall rules once — including stateful inspection and domain-name filtering for outbound traffic — and have those rules automatically applied to every existing and future VPC in the organization, rather than each account team maintaining its own rules. Which service is the BEST fit?
- A. Route 53 private hosted zones that override unwanted domain names
- B. Security groups in each VPC, shared across accounts through AWS RAM
- C. AWS Shield Standard applied to each VPC's internet gateway
- D. AWS Network Firewall, managed centrally with AWS Firewall Manager

<details><summary>Answer</summary>

**D.** AWS Network Firewall provides stateful inspection and domain-list filtering, and Firewall Manager can push a common policy to every account and VPC in the organization, including new ones as they're created.
Resource: <https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html>
</details>

**29.** A company's on-premises data center needs an encrypted connection to a VPC for a project that goes live in two weeks. The network team has already opened a case to order a dedicated Direct Connect circuit, but the vendor's lead time is several weeks. What should they use to get an encrypted connection running before launch?
- A. VPC peering
- B. An internet gateway
- C. AWS Site-to-Site VPN
- D. AWS Direct Connect without encryption

<details><summary>Answer</summary>

**C.** Site-to-Site VPN uses IPsec tunnels over the internet and can typically be set up within minutes to hours, unlike Direct Connect, which takes weeks to provision and isn't encrypted by default.
Resource: <https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html>
</details>

**30.** A media company migrated its private video thumbnails from a legacy setup that used an origin access identity (OAI) years ago, and now wants new distributions to use the current recommended approach, so that only its CloudFront distribution — and no one else, even someone who discovers the bucket's name — can read objects in the private S3 origin bucket. What should be configured?
- A. S3 Transfer Acceleration, with a bucket policy that requires the accelerate endpoint
- B. A public bucket policy that allows reads only from CloudFront's published IP ranges
- C. Origin access control (OAC) and a bucket policy scoped to the CloudFront service principal
- D. A pre-signed URL generated for every object and embedded in the application's web pages

<details><summary>Answer</summary>

**C.** OAC uses a bucket policy `Condition` tied to the specific distribution, so only that CloudFront distribution can read the bucket. OAC is the current recommended replacement for the legacy OAI approach.
Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
</details>

---

## Task 1.3: Determine appropriate data security controls

**31.** A healthcare startup stores patient intake forms in S3 and must satisfy an auditor's requirement for server-side encryption with a per-request audit trail of every encrypt and decrypt call in CloudTrail, plus the ability to revoke one engineer's access to the encryption key without touching the bucket policy at all. Which option meets this requirement?
- A. SSE-S3 (Amazon S3 managed keys)
- B. Client-side encryption with a locally stored key
- C. SSE-KMS with a customer managed key
- D. SSE-C with keys supplied by the client

<details><summary>Answer</summary>

**C.** SSE-KMS logs key usage in CloudTrail, and a customer managed key gives full control over who can use it through the key's own policy — independent of the bucket policy.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html>
</details>

**32.** A bucket using SSE-KMS handles 8,000 GET requests per second at peak, and the team's monthly AWS KMS bill has grown far larger than the S3 storage bill itself, with occasional `ThrottlingException` errors showing up in the application logs. What should be enabled to cut the number of calls made to KMS without giving up per-object encryption?
- A. Disable S3 Versioning on the bucket
- B. Switch the bucket to SSE-C
- C. Turn on S3 Transfer Acceleration
- D. Enable S3 Bucket Keys

<details><summary>Answer</summary>

**D.** A bucket-level key cuts the number of calls to KMS by up to 99% by reusing a time-limited data key for many objects, directly reducing both throttling and cost.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html>
</details>

**33.** A brokerage firm's compliance officer tells the cloud team that trade log objects must be impossible to delete or overwrite for 7 years — by anyone, including someone who somehow obtains root user credentials — to satisfy a regulatory record-keeping rule. What should be used?
- A. MFA Delete, enabled on the bucket by the root user
- B. S3 Versioning with a bucket policy that denies `s3:DeleteObject`
- C. S3 Object Lock in Governance mode with a 7-year retention period
- D. S3 Object Lock in Compliance mode with a 7-year retention period

<details><summary>Answer</summary>

**D.** In Compliance mode, no user — including the root user or an account with full administrative permissions — can shorten the retention period or delete the object before it expires. Governance mode can be bypassed by users with a special permission.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html>
</details>

**34.** A company already enforces TLS for every connection to its Amazon RDS for PostgreSQL instance using the `rds.force_ssl` parameter, but a new compliance requirement also calls for encryption at rest, and the instance was created two years ago without it. A short maintenance window has been approved. How can encryption at rest be added to this existing instance?
- A. Modify the instance, turn on encryption, and apply the change immediately
- B. Create an encrypted read replica and promote it to replace the primary
- C. Turn on TLS at the instance level a second time to trigger re-encryption
- D. Snapshot the instance, copy the snapshot with encryption enabled, and restore a new instance from the encrypted copy

<details><summary>Answer</summary>

**D.** Encryption at rest can only be set when an RDS instance is created, so an existing unencrypted instance must be snapshotted, the snapshot copied with encryption turned on, and a new instance restored from that encrypted copy.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html>
</details>

**35.** A company's data lake in S3 has grown to thousands of objects uploaded by dozens of teams, and no one is fully sure which files contain PII such as names, national ID numbers, or payment card numbers. Which service uses machine learning to discover and classify this kind of sensitive data in S3 automatically?
- A. Amazon GuardDuty
- B. AWS Glue DataBrew
- C. Amazon Macie
- D. Amazon Comprehend Medical

<details><summary>Answer</summary>

**C.** Amazon Macie uses machine learning and pattern matching to discover, classify, and report on sensitive data such as PII stored in S3.
Resource: <https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html>
</details>

**36.** A company's previous TLS certificate, bought from a third-party CA and installed manually, expired unnoticed last year and caused an outage. For the new architecture — an ALB fronted by a CloudFront distribution — the team wants a public certificate that renews itself automatically, at no extra cost, for both. What should be used?
- A. A self-signed certificate uploaded to IAM
- B. AWS Certificate Manager (ACM)
- C. AWS Private Certificate Authority
- D. AWS KMS with an asymmetric key

<details><summary>Answer</summary>

**B.** ACM public certificates are free and renew automatically as long as they remain in use and DNS validation stays in place. Note that the certificate used by CloudFront must be requested in `us-east-1`.
Resource: <https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html>
</details>

**37.** A payments company's PCI assessor requires that cryptographic keys be generated and stored in single-tenant hardware security modules validated to FIPS 140-2 Level 3, under the company's own exclusive administrative control — a shared, multi-tenant key service isn't acceptable to the assessor. Which service fits?
- A. AWS CloudHSM
- B. SSE-S3
- C. AWS KMS with AWS managed keys
- D. AWS Secrets Manager

<details><summary>Answer</summary>

**A.** CloudHSM provisions single-tenant, FIPS 140-2 Level 3 validated hardware security modules that the customer controls directly, unlike the shared infrastructure behind AWS KMS's AWS managed keys.
Resource: <https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html>
</details>

**38.** A bucket already uses default encryption with SSE-KMS for data at rest, but a security scan flagged that it still accepts plain HTTP requests through the S3 REST API. Every request to the bucket must use HTTPS. How is this enforced?
- A. Default bucket encryption with SSE-KMS and a customer managed key
- B. A bucket policy that denies requests where `aws:SecureTransport` is `false`
- C. S3 Block Public Access turned on at the account and bucket levels
- D. An S3 Access Point with a VPC network origin for every client

<details><summary>Answer</summary>

**B.** Encrypting data at rest doesn't protect data in transit. A bucket policy that denies requests when `aws:SecureTransport` is `false` forces every request to use HTTPS.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>
</details>

**39.** After a new hire accidentally made a test bucket public last quarter, leadership wants a control that makes it impossible for any S3 bucket in the account — existing or newly created, no matter what bucket policy or ACL someone attaches — to ever become public by mistake. What should be enabled?
- A. S3 Versioning with MFA Delete on every bucket
- B. Server access logging with alerts on public reads
- C. S3 Block Public Access at the account level
- D. S3 Object Lock in Compliance mode on every bucket

<details><summary>Answer</summary>

**C.** S3 Block Public Access, turned on at the account level, overrides any bucket policy or ACL that would otherwise make a bucket or object public — for existing and future buckets alike.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html>
</details>

**40.** A DevOps engineer needs to share an EBS snapshot, encrypted with a customer managed KMS key, with a partner's AWS account so the partner can restore it into their own VPC. The engineer shares the snapshot, but the partner's account still can't launch a volume from it. What else is required?
- A. Make the snapshot public so that the other account can copy it
- B. Copy the snapshot with the AWS managed key `aws/ebs`, then share the copy instead
- C. Nothing further; EBS in the other account decrypts customer managed keys automatically once a snapshot is shared
- D. Grant the partner account permission to use the KMS key in the key's own key policy

<details><summary>Answer</summary>

**D.** Sharing the snapshot alone isn't enough for a customer managed key: the target account also needs to be granted use of that key in its key policy before it can decrypt and restore from the snapshot. (Snapshots encrypted with the AWS managed key `aws/ebs` can't be shared across accounts at all.)
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html>
</details>

**41.** A company's backups today are a patchwork of manual RDS snapshots, an EBS snapshot lifecycle policy, and a cron job that exports DynamoDB tables, with no single view of what's actually protected. After a ransomware scare in the industry, the CISO wants automatic, policy-driven backups of EBS, RDS, DynamoDB, and EFS, copied to a second Region, with a vault lock that prevents anyone — including an administrator — from shortening retention or deleting backups early. Which service should they use?
- A. S3 Cross-Region Replication of data exported from each service
- B. AWS DataSync tasks that copy each resource's data to a second Region
- C. Lambda functions that snapshot each resource and copy it to another Region
- D. AWS Backup with backup plans, cross-Region copy, and Vault Lock

<details><summary>Answer</summary>

**D.** AWS Backup centralizes policy-driven backup across EBS, RDS, DynamoDB, EFS, and other services, supports cross-Region copy, and Vault Lock can make a vault's policy immutable — even to the account's own administrators.
Resource: <https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html>
</details>

**42.** A security engineer, used to rotating database secrets in AWS Secrets Manager every 30 days, assumes AWS KMS customer managed keys rotate on the same schedule. Checking the console, they see automatic key rotation turned on with the default settings. How often does that actually rotate the key material, and can the schedule be changed?
- A. Every year (365 days) by default; the rotation period can be customized
- B. Every 30 days, matching the default Secrets Manager schedule
- C. Every 90 days, and the rotation period can't be changed
- D. Never automatically; customer managed keys can only be rotated on demand

<details><summary>Answer</summary>

**A.** Automatic rotation for a customer managed symmetric key defaults to every 365 days, and the period can be customized (AWS supports a range between 90 and 2,560 days). Old key material is retained so previously encrypted data can still be decrypted.
Resource: <https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html>
</details>

**43.** After an incident where an unencrypted EBS volume went unnoticed for months, a company wants a service that continuously evaluates resource configurations against rules such as "all EBS volumes must be encrypted," flags resources as noncompliant as soon as they drift, and keeps a full configuration history for every resource — not just a log of who called which API. Which service fits?
- A. AWS CloudTrail
- B. Amazon Inspector
- C. AWS Trusted Advisor
- D. AWS Config

<details><summary>Answer</summary>

**D.** AWS Config continuously records configuration changes and evaluates resources against rules like required encryption, flagging drift and keeping a configuration history — which is different from CloudTrail's record of API calls.
Resource: <https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html>
</details>

**44.** A prospective enterprise customer's security team asks for the company's AWS SOC 2 and PCI DSS attestation reports before signing a contract. Where can the company's cloud team download these AWS compliance reports?
- A. AWS Config
- B. AWS Security Hub
- C. AWS Artifact
- D. AWS Audit Manager

<details><summary>Answer</summary>

**C.** AWS Artifact provides on-demand access to AWS's compliance reports and agreements, including SOC and PCI reports, for exactly this kind of customer due-diligence request.
Resource: <https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html>
</details>

**45. (Select TWO.)** A team migrating an application to an ALB with a target group of EC2 instances is reviewing a launch checklist. The bucket storing the app's static assets already has default SSE-S3 encryption, and the instances' EBS volumes are already encrypted. The one remaining requirement is that every request from a browser reaches the application encrypted in transit, even if the client mistakenly types `http://` instead of `https://`. Which TWO steps together achieve this?
- A. Turn on default SSE-S3 encryption for the application's S3 bucket
- B. Turn on automatic rotation for the application's KMS key
- C. Add a rule to the HTTP listener that redirects all requests to HTTPS
- D. Turn on EBS encryption for the instances in the target group
- E. Add an HTTPS listener to the ALB that uses an ACM certificate

<details><summary>Answer</summary>

**C, E.** The HTTPS listener terminates TLS using the ACM certificate, and the redirect rule on the HTTP listener sends clients that connect over plain HTTP to HTTPS instead of serving them unencrypted. The other options protect data at rest, which this checklist item already covers.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html>
</details>
