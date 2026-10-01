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

```diagram
Root user -> *MFA | enabled on root -> Root-only tasks | rarely
Founder & Contractor -> *IAM Identity Center | or IAM roles -> Daily work
```

Why not the others:
- **A.** Permissions boundaries apply only to IAM users and roles. They can't be attached to the root user, so they can't limit what it does.
- **B.** AWS recommends not creating root access keys at all. Keeping them in Secrets Manager still leaves long-term, all-powerful keys that could leak.
- **C.** The root user can't be deleted, and in a standalone account its password can always be recovered by email. MFA is what protects the root user.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html>
</details>

**2.** A retail company runs a nightly reporting job on a single Amazon EC2 instance in `us-west-2`. The job already streams its logs to CloudWatch Logs and needs read-only access to objects in one S3 bucket that holds the previous day's sales exports. A former intern hard-coded an IAM user's access keys into the job's configuration file, and the security team wants that fixed. What is the MOST secure way to grant the instance access to the bucket?
- A. Add a bucket policy that allows anonymous reads from the instance's Elastic IP address
- B. Move the IAM user's access keys into AWS Secrets Manager and have the job retrieve them at startup
- C. Attach an IAM role with a least-privilege policy to the instance through an instance profile
- D. Rotate the IAM user's access keys automatically every 24 hours using a scheduled Lambda function

<details><summary>Answer</summary>

**C.** Instance profiles deliver temporary, automatically rotated credentials to the instance, removing the need for any long-term access keys at all.

```diagram
*IAM role | least privilege -(instance profile)-> [EC2 instance: Reporting job] -(temporary credentials)-> S3 bucket | sales exports
```

Why not the others:
- **A.** This makes objects readable by anyone sending requests from that address, relying on network location instead of identity. It's public access, which S3 Block Public Access exists to prevent.
- **B.** The job would still depend on a long-term IAM user access key; Secrets Manager only changes where the key is stored. An instance role removes the key entirely.
- **D.** Frequent rotation shortens the exposure window if a key leaks, but still leaves long-term keys and custom rotation code to maintain. Instance profiles rotate temporary credentials automatically.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html>
</details>

**3.** A company runs 40 AWS accounts across four organizational units in AWS Organizations. The 12 developer accounts in the Sandbox OU are also subject to a separate AWS Budgets alert that emails the finance team once spending passes $500 a month. After a Sandbox account administrator disabled AWS CloudTrail during a demo, the security team wants a guardrail that makes it impossible for anyone in the Sandbox OU — including account administrators — to disable CloudTrail or leave the organization, without touching each account individually. What should they use?
- A. AWS Config rules with automatic remediation that turn CloudTrail back on
- B. A service control policy (SCP) attached to the Sandbox OU
- C. IAM permissions boundaries attached to every user and role in the Sandbox accounts
- D. A budget action in AWS Budgets that stops EC2 and RDS resources once the threshold is hit

<details><summary>Answer</summary>

**B.** SCPs set the maximum permissions for every principal in the member accounts under an OU, including administrators (but not the management account), so a well-written deny SCP can block both actions everywhere in the OU at once.

```diagram
*SCP | deny-list -(attached to)-> [Sandbox OU: Account admins & Users and roles] -x(StopLogging)-> CloudTrail
```

Why not the others:
- **A.** Config remediation reacts after the fact: CloudTrail stays off until Config notices and turns it back on. It also can't stop an account from leaving the organization.
- **C.** Administrators in each account can edit or detach permissions boundaries, and boundaries must be attached to every user and role one at a time, so they can't enforce this OU-wide.
- **D.** Budget actions respond to spending thresholds. They don't block API calls such as `cloudtrail:StopLogging` or `organizations:LeaveOrganization`.

Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**4.** A new cloud engineer on the security team is drafting internal documentation about service control policies (SCPs) ahead of a quarterly audit, and wants to state the rules correctly. Which statement about SCPs is TRUE?
- A. SCPs limit the maximum available permissions but do not grant any permissions
- B. SCPs grant permissions to the IAM users and roles in the accounts they're attached to
- C. SCPs replace the IAM identity-based policies in the accounts they're attached to
- D. SCPs restrict every principal in the organization, including the management account

<details><summary>Answer</summary>

**A.** An action is allowed only if both the SCP and an IAM policy allow it. SCPs never grant access on their own and don't apply to the management account.

```diagram
SCP | maximum allowed & IAM policy | what is granted -(both must allow)-> *Effective permissions | the overlap
```

Why not the others:
- **B.** SCPs never grant permissions. An identity-based or resource-based policy must still allow the action for it to succeed.
- **C.** SCPs work alongside identity-based policies, and both must allow an action. They don't replace or remove them.
- **D.** SCPs don't affect users or roles in the management account. They apply only to member accounts.

Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>
</details>

**5.** A 3,000-employee company has an on-premises Microsoft Active Directory domain and 15 AWS accounts under AWS Organizations. The helpdesk currently resets around 200 forgotten passwords a month across various systems, and leadership wants employees to sign in to any of the 15 AWS accounts from a single portal using their existing corporate AD credentials, without AWS ever storing a separate copy of those passwords. Which service is the BEST fit?
- A. Amazon Cognito user pools federated with AD, with one app client per AWS account
- B. AWS Secrets Manager, storing a copy of each employee's AD password for every account
- C. IAM users in each account, with passwords kept in sync with AD by a scheduled script
- D. AWS IAM Identity Center, using AD as the identity source

<details><summary>Answer</summary>

**D.** IAM Identity Center (connected to AD through AWS Directory Service or an external IdP) gives workforce users single sign-on across accounts in AWS Organizations and can use AD as the identity source, without duplicating passwords.

```diagram
Employee -(AD credentials)-> *IAM Identity Center | AD as identity source -> [AWS Organizations: Account 1 & Account 2 & Account 15]
*IAM Identity Center | AD as identity source ~(verify password)~> On-premises AD
```

Why not the others:
- **A.** Cognito user pools are for customer-facing app sign-in. They don't provide workforce single sign-on to the AWS console across accounts.
- **B.** Storing copies of AD passwords is exactly what the company wants to avoid, and it doesn't provide a sign-in portal.
- **C.** Separate IAM users mean 15 sets of credentials per employee, with password copies stored in AWS. Sync scripts are also fragile.

Resource: <https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html>
</details>

**6.** Account A (Engineering) and Account B (Data) belong to the same AWS Organization and are already linked by a site-to-site VPN that the network team set up for an unrelated project. A developer who normally works in Account A now needs temporary, auditable access to manage DynamoDB tables in Account B for a two-week migration, after which access should stop automatically. What is the recommended approach?
- A. Create an IAM user in Account B and share its access keys with the developer for the migration
- B. Create a role in Account B that trusts Account A, and let the developer assume it
- C. Attach an SCP to Account B that allows the developer's IAM user from Account A
- D. Route the request through the existing VPN and reach DynamoDB in Account B over a private IP

<details><summary>Answer</summary>

**B.** Cross-account role delegation hands out short-lived credentials from AWS STS, is fully logged in CloudTrail, and can simply not be renewed once the migration ends — no keys to revoke.

```diagram
[Account A: Developer] -(sts:AssumeRole)-> [Account B: *IAM role | trusts Account A -> DynamoDB tables]
AWS STS -(short-lived credentials)-> Developer -(every call)-> CloudTrail | audit log
```

Why not the others:
- **A.** Shared long-term access keys aren't tied to the developer, don't expire on their own, and have to be revoked by hand when the migration ends.
- **C.** SCPs never grant permissions, so an SCP can't give a user in another account access to anything.
- **D.** DynamoDB access is authorized by IAM no matter which network path a request takes. A VPN provides connectivity, not credentials or permissions.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html>
</details>

**7.** A platform team lets developers self-service the creation of IAM roles for their own Lambda functions through an internal Service Catalog product, so they no longer file infrastructure tickets. Security requires that no matter what policy a developer attaches to a new role, the role's effective permissions can never exceed a fixed, pre-approved set. What should be used to enforce this cap?
- A. IAM permissions boundaries
- B. AWS Firewall Manager
- C. Resource-based policies
- D. Session policies only

<details><summary>Answer</summary>

**A.** A permissions boundary sets the maximum permissions an identity-based policy can grant to an IAM entity. It's often required as a condition on `iam:CreateRole` so self-service role creation can't exceed it.

```diagram
Developer's policy | may grant anything -> *Permissions boundary | fixed ceiling -> Effective permissions | overlap of both
```

Why not the others:
- **B.** Firewall Manager centrally manages WAF, Shield, security group and Network Firewall policies. It doesn't limit IAM permissions.
- **C.** Resource-based policies control who can access a particular resource. They can't cap what a role is allowed to do across all services.
- **D.** A session policy only applies when it's passed while assuming the role, so a developer could simply not pass one. It isn't a permanent cap on the role.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html>
</details>

**8.** A finance analyst's IAM user belongs to a group whose policy explicitly allows `s3:*` on the `finance-reports` bucket. The analyst's account also sits under an OU with an SCP, added last month after an accidental-deletion incident, that explicitly denies `s3:DeleteObject` for every principal. The analyst, unaware the SCP exists, tries to delete a report object from the console. What happens?
- A. Denied, because an explicit deny overrides any allow
- B. Allowed, because SCPs don't apply to S3 actions
- C. Allowed, because the IAM group policy is more specific than the SCP
- D. The result depends on which policy was attached first

<details><summary>Answer</summary>

**A.** In policy evaluation logic, an explicit deny in any applicable policy — including an SCP — always wins over an allow elsewhere.

```diagram
Analyst -(s3:DeleteObject)-> Group policy | allow s3:* -> SCP | explicit deny -x-> *Request denied | explicit deny wins
```

Why not the others:
- **B.** SCPs apply to every AWS service's actions, including S3.
- **C.** IAM doesn't rank policies by how specific they are. An explicit deny wins over any allow.
- **D.** Policy evaluation doesn't depend on the order policies were attached.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html>
</details>

**9.** A photo-sharing mobile app expects 5 million registered users within its first year. Push notifications already go out through Amazon SNS mobile push, and marketing wants a referral program built around user IDs later. Separately, engineering needs users to be able to sign up and sign in, and then receive temporary AWS credentials scoped so each user can upload only to their own prefix in one shared S3 bucket. Which combination is correct?
- A. An IAM user for each customer, created at sign-up by a Lambda function
- B. Cognito user pools for sign-in and Cognito identity pools for AWS credentials
- C. IAM Identity Center, with each customer added as a workforce user
- D. AWS Directory Service Simple AD, with a group for each customer's S3 prefix

<details><summary>Answer</summary>

**B.** User pools handle the user directory and tokens. Identity pools exchange those tokens for scoped STS credentials, for example using `${cognito-identity.amazonaws.com:sub}` in the policy, which scales to millions of users far better than per-user IAM identities.

```diagram
Mobile user -(sign up / sign in)-> *Cognito user pool -(JWT)-> *Cognito identity pool -(scoped STS credentials)-> S3 | own prefix only
```

Why not the others:
- **A.** IAM users are meant for a limited number of people and workloads, not millions of app customers, and each account has a quota on how many it can have.
- **C.** IAM Identity Center is for employees (workforce) signing in to AWS accounts and business apps, not for public customer sign-up in a mobile app.
- **D.** Simple AD is a managed directory for Windows workloads. It doesn't handle mobile sign-up or issue per-user AWS credentials.

Resource: <https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html>
</details>

**10.** A company already relies on AWS Trusted Advisor's weekly cost checks to flag idle EC2 instances. After a contractor accidentally shared a KMS key with an external AWS account, the security team wants an automated, ongoing way to find any S3 bucket, KMS key, IAM role, or Lambda function whose resource policy grants access to a principal outside the company's AWS Organization. Which tool should they turn to?
- A. Amazon Inspector
- B. IAM Access Analyzer
- C. AWS Artifact
- D. AWS Audit Manager

<details><summary>Answer</summary>

**B.** IAM Access Analyzer uses automated reasoning to find resource policies that grant access to principals outside your defined zone of trust.

```diagram
*IAM Access Analyzer | zone of trust: organization -(scans)-> S3 & KMS & IAM roles & Lambda -> Finding | external access
```

Why not the others:
- **A.** Amazon Inspector scans workloads for software vulnerabilities and network exposure. It doesn't analyze resource policies for external access.
- **C.** AWS Artifact is where you download AWS's own compliance reports and agreements.
- **D.** Audit Manager collects evidence to help you prepare for audits. It doesn't find resources shared outside your organization.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html>
</details>

**11.** A company plans to onboard around 10 new AWS accounts per quarter for new product teams. It wants every new account to start with a consistent baseline of preventive guardrails (SCPs), detective guardrails, and centralized logging, provisioned automatically — the manual checklist that currently takes two engineers a full day per account isn't scaling. Which service should be used?
- A. AWS Control Tower
- B. AWS Systems Manager
- C. AWS Service Catalog alone
- D. AWS Config

<details><summary>Answer</summary>

**A.** Control Tower sets up a landing zone on top of Organizations with preventive (SCP) and detective (Config) controls, and automates account vending through Account Factory.

```diagram
*AWS Control Tower -> Account Factory | new account -> [Landing zone: SCP guardrails & Config detective controls & Central logging]
```

Why not the others:
- **B.** Systems Manager manages and operates instances and resources. It doesn't create accounts or set up a landing zone with guardrails.
- **C.** Service Catalog can offer approved products, and Control Tower's Account Factory uses it, but on its own it doesn't provide guardrails, logging or a landing zone.
- **D.** AWS Config provides detective rules only. It can't create accounts or apply preventive controls such as SCPs.

Resource: <https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html>
</details>

**12. (Select TWO.)** A security audit produced a list of proposed IAM practices for the company to adopt. Which TWO should actually be adopted?
- A. Share one IAM user among the on-call rotation so pager alerts always come from the same identity
- B. Grant least privilege from the start, and refine it later using IAM's last-accessed information
- C. Bake long-term access keys into a golden AMI so new instances start with working credentials immediately
- D. Reserve the root user for billing tasks, since ordinary IAM users can't be given access to the Billing console
- E. Use temporary credentials from roles and federation instead of creating long-term access keys wherever possible

<details><summary>Answer</summary>

**B, E.** IAM users and roles can be granted billing permissions directly, so the root user doesn't need to be reserved for billing, and shared credentials or embedded keys work against least privilege and auditability.

```diagram
New role -> *Least privilege | at the start -(IAM last-accessed data)-> Refined policy
App or user -> *Role or federation -(temporary credentials)-> AWS APIs
Long-term access keys -x-> AWS APIs
```

Why not the others:
- **A.** A shared IAM user means no one can tell which person did what, which breaks accountability and auditing.
- **C.** Long-term keys baked into an AMI end up on every copy of the image, can leak easily, and are hard to rotate.
- **D.** IAM users and roles can be given Billing console access once IAM access to billing is activated, so the root user isn't needed for billing.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html>
</details>

**13.** During a compliance review, auditors ask the security team to produce every API call made by any principal in any of the company's 40 AWS accounts over the past 18 months, and to prove the records haven't been altered. Today, each account has its own local CloudTrail trail, and log files are kept only in each account's default Region. What is the BEST solution going forward?
- A. Create an organization trail in CloudTrail that delivers to a central S3 bucket with Object Lock
- B. Enable VPC Flow Logs in each account and send them to a central CloudWatch Logs group
- C. Use an AWS Config aggregator in the management account to collect configuration history
- D. Create a CloudWatch metric filter in each account and a cross-account dashboard of API calls

<details><summary>Answer</summary>

**A.** An organization trail records management events for every member account into one place. Log file validation detects tampering, and Object Lock on the destination bucket prevents deletion or modification.

```diagram
[Organization: Account 1 & Account 2 & Account 40] -> *Organization trail | log file validation -> *Central S3 bucket | Object Lock
```

Why not the others:
- **B.** VPC Flow Logs record network traffic metadata, not API calls.
- **C.** AWS Config records resource configuration changes, not every API call, and it doesn't prove the records weren't altered.
- **D.** Metric filters count matching events for alarms. They don't create a complete, tamper-evident record of every API call.

Resource: <https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html>
</details>

**50.** A company is moving 30 Windows Server applications to EC2. The applications depend on Active Directory features such as Group Policy, Kerberos authentication and domain join, and the company needs a trust relationship with its on-premises AD forest so employees keep using their existing accounts. It doesn't want to run and patch its own domain controllers on EC2. What should it use?
- A. Simple AD, with a trust to the on-premises forest
- B. AD Connector as the domain that the servers join
- C. AWS Managed Microsoft AD (AWS Directory Service)
- D. Cognito user pools federated with on-premises AD

<details><summary>Answer</summary>

**C.** AWS Managed Microsoft AD is an actual Microsoft Active Directory run by AWS. It supports Group Policy, Kerberos and domain join, and can form trusts with an on-premises forest, while AWS handles patching and replication.

```diagram
[AWS: *AWS Managed Microsoft AD | patched by AWS -> EC2 Windows apps | domain-joined] -(forest trust)-> On-premises AD
```

Why not the others:
- **A.** Simple AD is a basic, Samba-based directory. It doesn't support trust relationships with other domains.
- **B.** AD Connector only forwards requests to the on-premises directory. It isn't a directory in AWS, so every sign-in depends on reaching the on-premises domain controllers.
- **D.** Cognito handles sign-in for customer-facing apps. It doesn't provide Windows domain services such as Group Policy or Kerberos.

Resource: <https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_microsoft_ad.html>
</details>

**51.** A network team manages a central VPC in a dedicated networking account. Application teams in 12 other accounts in the same organization need to launch EC2 instances and databases directly into subnets of that central VPC, while the network team keeps sole control of the route tables, gateways and network ACLs. What should the network team use?
- A. VPC peering from each application account's own VPC
- B. AWS Resource Access Manager (AWS RAM) to share the subnets
- C. IAM roles in the networking account for each team to assume
- D. A transit gateway attachment for each application account

<details><summary>Answer</summary>

**B.** With VPC sharing, the VPC owner uses AWS RAM to share subnets with other accounts in the organization. Those accounts launch their own resources into the shared subnets, but they can't change the VPC's route tables, gateways or network ACLs.

```diagram
[Networking account: Central VPC | keeps routes, gateways, NACLs] -> *AWS RAM | share subnets -> [App accounts: Shared subnets -> EC2 & RDS]
```

Why not the others:
- **A.** Peering connects separate VPCs, so each team would still own and run its own VPC and network.
- **C.** Assuming a role in the networking account would create the teams' resources in that account and give them its permissions, instead of keeping resources in their own accounts.
- **D.** A transit gateway connects separate VPCs. The teams would still need VPCs of their own instead of launching into the central one.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-sharing.html>
</details>

**52.** A platform team wants developers to launch pre-approved infrastructure, such as a standard three-tier web stack, without giving them broad IAM permissions to create any resource they like. Developers should choose from an approved list, and each product should launch using a role that has only the permissions that product needs. What should the platform team use?
- A. AWS Control Tower Account Factory
- B. IAM permissions boundaries on each developer
- C. AWS Config rules that delete unapproved resources
- D. AWS Service Catalog with launch constraints

<details><summary>Answer</summary>

**D.** Service Catalog lets administrators publish approved, CloudFormation-based products in portfolios. A launch constraint makes a product launch with a specified IAM role, so developers don't need broad permissions of their own.

```diagram
Developer -(launch from approved list)-> *Service Catalog portfolio -(launch constraint role)-> CloudFormation stack | three-tier web
Developer -x(no broad IAM rights)-> CloudFormation stack | three-tier web
```

Why not the others:
- **A.** Account Factory creates new AWS accounts. It doesn't give developers a catalog of approved infrastructure to launch.
- **B.** A permissions boundary caps what developers can do, but they'd still need broad permissions to build the stacks themselves, with no approved list.
- **C.** Deleting resources after they're created is reactive, and it doesn't give developers an approved list to choose from.

Resource: <https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html>
</details>

**57.** A company has 30 project teams and wants to stop writing a separate IAM policy for each one. Engineers should be able to start and stop only the EC2 instances whose `project` tag matches the `project` tag on their own IAM role, and new projects should work without any policy changes. Which approach fits?
- A. Attribute-based access control using `aws:PrincipalTag` and resource tags
- B. One IAM group per project, each listing its own instance ARNs
- C. A service control policy per project, attached to the organization root
- D. Resource-based policies attached to each EC2 instance

<details><summary>Answer</summary>

**A.** Attribute-based access control compares tags on the caller with tags on the resource in a single policy (for example, requiring `ec2:ResourceTag/project` to equal `${aws:PrincipalTag/project}`), so new projects need only tags, not new policies.

```diagram
[Engineer role, tag project=alpha: *ABAC policy | ResourceTag must equal PrincipalTag] -(start / stop)-> EC2 | tag project=alpha
Same engineer role -x(tags don't match)-> EC2 | tag project=beta
```

Why not the others:
- **B.** Per-project groups that list instances are exactly the per-team policy upkeep the company wants to avoid, and the lists go stale as instances change.
- **C.** SCPs don't grant permissions, and SCPs attached at the root would apply to everyone in the organization.
- **D.** EC2 instances don't support resource-based policies.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html>
</details>

**58.** For data-residency reasons, a company must stop anyone in its member accounts, including account administrators, from creating resources outside `eu-west-1` and `eu-central-1`. Global services such as IAM and CloudFront must keep working. What is the most effective way to enforce this across every account?
- A. An identity-based IAM policy in every account that allows only the two Regions
- B. AWS Config rules in every Region that flag resources created elsewhere
- C. An SCP denying other Regions with `aws:RequestedRegion`, exempting global services
- D. A permissions boundary on every IAM role that lists only the two Regions

<details><summary>Answer</summary>

**C.** An SCP applies to every principal in the member accounts, including administrators, so denying requests whose `aws:RequestedRegion` isn't allowed enforces the rule everywhere. Global services are exempted with `NotAction`, because their requests go to a single Region such as `us-east-1`.

```diagram
*SCP | deny unless aws:RequestedRegion allowed -> [Member accounts: Admins & Users] -(allowed)-> eu-west-1 & eu-central-1
[Member accounts: Admins & Users] -x-> Other Regions
```

Why not the others:
- **A.** Administrators in each account could edit or remove the policy, and it would need maintaining in every account.
- **B.** Config rules only detect resources after they've been created in the wrong Region.
- **D.** Boundaries must be attached to every role one at a time, and account administrators can change them.

Resource: <https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_examples.html>
</details>

**64.** A SaaS monitoring vendor needs read-only access to a customer's AWS account, so the customer creates an IAM role that trusts the vendor's AWS account. The customer's security team worries that one of the vendor's other customers could trick the vendor into using this role on its behalf, which is known as the confused deputy problem. What should the role's trust policy require?
- A. MFA on every `AssumeRole` call that the vendor makes
- B. A source IP condition matching the vendor's office network
- C. That the vendor use long-term access keys instead of the role
- D. An `sts:ExternalId` condition unique to this customer

<details><summary>Answer</summary>

**D.** A unique external ID in the trust policy's condition means the vendor can assume the role only when acting for this specific customer, which stops other customers from tricking the vendor into using it.

```diagram
Vendor -(AssumeRole + ExternalId)-> [Customer account: *Role trust policy | requires sts:ExternalId] -> Read-only access
Other customer's request via vendor -x(wrong or no ExternalId)-> *Role trust policy | requires sts:ExternalId
```

Why not the others:
- **A.** The vendor's systems assume the role automatically and can't supply MFA, and MFA doesn't show which customer the vendor is acting for.
- **B.** The vendor serves every customer from the same systems, so an IP condition can't tell one customer's requests from another's.
- **C.** Long-term access keys are riskier than role credentials and don't solve the confused deputy problem.

Resource: <https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html>
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

```diagram
Users -> *AWS WAF | SQLi and XSS managed rules -> ALB -> Web app
Attackers -x(SQLi / XSS)-> *AWS WAF | SQLi and XSS managed rules
```

Why not the others:
- **B.** Shield Standard protects against common network and transport-layer DDoS attacks. It doesn't inspect requests for SQL injection or XSS.
- **C.** GuardDuty detects threats from logs and reports findings. It doesn't block malicious HTTP requests.
- **D.** Network ACLs filter by IP address and port and can't inspect request contents, and attackers can easily switch IPs.

Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html>
</details>

**15.** An online gaming company was hit by a 300 Gbps UDP reflection attack last month that also drove EC2 Auto Scaling costs up as the fleet scaled out to absorb the flood of traffic. For future attacks, the company wants a direct line to AWS's DDoS Response Team, more advanced attack diagnostics, and reimbursement for the scaling charges the attack caused. What should they choose?
- A. AWS WAF alone
- B. AWS Shield Advanced
- C. Amazon Inspector
- D. AWS Shield Standard

<details><summary>Answer</summary>

**B.** Shield Advanced adds Shield Response Team (SRT) access, enhanced detection, and DDoS cost protection for scaling charges. Shield Standard is free and automatic but offers none of these.

```diagram
UDP reflection flood -> *Shield Advanced -> EC2 fleet
*Shield Advanced -> Shield Response Team & Attack diagnostics & Cost protection | scaling charges
```

Why not the others:
- **A.** AWS WAF filters HTTP(S) requests at Layer 7. It doesn't absorb UDP reflection floods, and it doesn't include SRT access or DDoS cost protection.
- **C.** Amazon Inspector scans workloads for software vulnerabilities. It has nothing to do with DDoS protection.
- **D.** Shield Standard is free and automatic, but it doesn't include Shield Response Team access, advanced diagnostics or cost protection.

Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html>
</details>

**16.** A junior engineer adds a deny rule for a malicious IP address to a subnet's network ACL, and is confused why the team can't just achieve the same block by editing a security group instead. Which statement correctly explains the key difference between security groups and network ACLs here?
- A. Security groups are stateful and allow-only; NACLs are stateless and support deny rules
- B. Security groups apply to subnets; NACLs apply to each instance's network interface
- C. Security groups are stateless and support deny rules; NACLs are stateful and allow-only
- D. Both are stateful, but only NACLs evaluate numbered rules in order and support deny rules

<details><summary>Answer</summary>

**A.** Security groups work at the ENI level, are stateful, and can only allow traffic. NACLs work at the subnet level, are stateless, and evaluate numbered rules — including deny rules — in order.

```diagram
Traffic -> [Subnet boundary: *Network ACL | stateless, allow + deny] -> [Instance ENI: *Security group | stateful, allow only] -> EC2
```

Why not the others:
- **B.** This is reversed: security groups apply to network interfaces (instances), and network ACLs apply to subnets.
- **C.** This is reversed: security groups are stateful and allow-only, while network ACLs are stateless and support deny rules.
- **D.** Network ACLs are stateless, not stateful: return traffic must be allowed explicitly.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html>
</details>

**17.** A subnet hosts 25 EC2 instances behind an internal load balancer, each with its own security group tailored to its application. The SOC identifies a single external IP address running automated credential-stuffing attempts against every instance in the subnet, and wants to block that one address from reaching any of them without editing 25 separate security groups. What is the simplest option?
- A. Detach the internet gateway from the VPC until the attack stops
- B. Attach an IAM policy that denies requests from that `aws:SourceIp`
- C. Add a deny rule for the address to the subnet's network ACL
- D. Add a deny rule for the address to each instance's security group

<details><summary>Answer</summary>

**C.** Security groups can't deny traffic. A single NACL deny rule on the subnet (or an AWS WAF rule, for HTTP/S traffic) blocks the address for every instance at once.

```diagram
Attacker IP -x(NACL deny rule)-> [Subnet: *Network ACL -> 25 instances | each with own security group]
```

Why not the others:
- **A.** Detaching the internet gateway cuts off all internet traffic for the whole VPC, not just the one attacker.
- **B.** IAM policies control calls to AWS APIs. They don't filter network traffic reaching your instances.
- **D.** Security groups only support allow rules, so they can't deny a specific IP address.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html>
</details>

**18.** A fleet of 50 EC2 instances in a private subnet is managed with AWS Systems Manager Patch Manager on a monthly maintenance window. The instances need to reach the internet to download OS patches and package-repository metadata, but security policy forbids any inbound connection from the internet to these instances. What should be deployed?
- A. An Elastic IP address attached to each instance in the private subnet
- B. A virtual private gateway attached to the VPC, with route propagation enabled
- C. A route from the private subnet directly to the internet gateway
- D. A NAT gateway in a public subnet, with a route from the private subnet to it

<details><summary>Answer</summary>

**D.** A NAT gateway lets instances in a private subnet initiate outbound IPv4 traffic while blocking unsolicited inbound connections from the internet. (For IPv6, use an egress-only internet gateway instead.)

```diagram
[Private subnet: EC2 fleet] -(outbound only)-> [Public subnet: *NAT gateway] -> Internet gateway -> Patch repositories
Internet -x(unsolicited inbound)-> *NAT gateway
```

Why not the others:
- **A.** An Elastic IP only works through an internet gateway route, which would make the instances reachable from the internet, the opposite of the requirement.
- **B.** A virtual private gateway connects the VPC to an on-premises network over VPN, not to the internet.
- **C.** Routing the subnet straight to an internet gateway makes it a public subnet. Instances would need public IPs, which also exposes them to inbound connections.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html>
</details>

**19.** A data-processing fleet of 200 EC2 instances in private subnets reads and writes several terabytes a day to Amazon S3. Traffic currently flows through a NAT gateway, and the monthly NAT data-processing charge has become the single largest line item on the bill. The instances don't need to reach any other AWS service privately right now. What is the MOST cost-effective way to remove this traffic from the NAT gateway?
- A. AWS Direct Connect
- B. A Site-to-Site VPN connection
- C. An S3 interface endpoint (AWS PrivateLink)
- D. An S3 gateway VPC endpoint

<details><summary>Answer</summary>

**D.** Gateway endpoints (for S3 and DynamoDB) are free and are added to route tables, eliminating the NAT data-processing charge for that traffic. Interface endpoints work too, but are billed per hour and per GB.

```diagram
[Private subnet: 200 EC2 instances] -(route table entry)-> *S3 gateway endpoint | free -> Amazon S3
[Private subnet: 200 EC2 instances] ~(bypassed)~> NAT gateway | per-GB charge
```

Why not the others:
- **A.** Direct Connect links an on-premises network to AWS. It doesn't change how EC2 instances in a VPC reach S3, and it adds significant cost.
- **B.** A Site-to-Site VPN connects an on-premises network to the VPC. It doesn't give the instances a cheaper path to S3.
- **C.** An S3 interface endpoint would also bypass the NAT gateway, but it's billed per hour and per GB. A gateway endpoint for S3 is free.

Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html>
</details>

**20.** A SaaS company runs an internal pricing API in its VPC and wants to expose it privately to 300 customer VPCs across separate AWS accounts. Several of those customer VPCs, after past mergers and acquisitions, happen to use the exact same `10.0.0.0/16` CIDR block as each other. The company also doesn't want customers to see or route to anything else in its VPC. What should be used?
- A. AWS PrivateLink: an endpoint service behind a Network Load Balancer
- B. A transit gateway shared with each customer's account through AWS RAM
- C. An internet-facing ALB, restricted to customer IP ranges by a security group
- D. A VPC peering connection with each customer VPC, plus route table entries

<details><summary>Answer</summary>

**A.** PrivateLink exposes a service in one direction through interface endpoints and works even when the customer CIDRs overlap with each other or with the provider's VPC — something VPC peering and transit gateway attachments can't do.

```diagram
[Customer VPC | 10.0.0.0/16: *Interface endpoint] -(PrivateLink)-> *Endpoint service -> [Provider VPC: Network Load Balancer -> Pricing API]
```

Why not the others:
- **B.** Transit gateways can't route between VPCs with overlapping CIDRs, and they give customers network-level routing into the provider's VPC.
- **C.** An internet-facing load balancer isn't private, and maintaining IP allowlists for 300 customers is fragile.
- **D.** VPC peering doesn't work between overlapping CIDRs, and each peering opens routing between whole VPCs rather than exposing one service.

Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html>
</details>

**21.** After a security review, a company enables VPC Flow Logs, CloudTrail management and data events, and Route 53 Resolver query logging across every account. It now wants a managed service that continuously analyzes all of these logs together, without any additional infrastructure to run, to detect threats such as cryptocurrency mining, command-and-control traffic, or compromised IAM credentials. Which service fits?
- A. Amazon Macie
- B. Amazon GuardDuty
- C. AWS Audit Manager
- D. Amazon Inspector

<details><summary>Answer</summary>

**B.** GuardDuty continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs (among other sources) using threat intelligence and machine learning, with nothing for the customer to deploy or manage.

```diagram
VPC Flow Logs & CloudTrail events & DNS query logs -> *Amazon GuardDuty | ML + threat intel -> Findings | crypto mining, C2, stolen keys
```

Why not the others:
- **A.** Amazon Macie discovers sensitive data such as PII in S3. It doesn't analyze logs for threats.
- **C.** Audit Manager collects evidence for compliance audits. It doesn't detect threats.
- **D.** Amazon Inspector scans for software vulnerabilities and network exposure. It doesn't analyze log activity for threats.

Resource: <https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html>
</details>

**22.** A company pushes new container images to Amazon ECR several times a day and also runs dozens of Lambda functions built on shared open-source layers. After a recent CVE affected a popular logging library, leadership wants automatic, ongoing scanning of EC2 instances, ECR images, and Lambda functions for known software vulnerabilities and unintended network exposure, without an engineer manually running a scanner. Which service should they use?
- A. Amazon Inspector
- B. Amazon Detective
- C. AWS Security Hub
- D. Amazon GuardDuty

<details><summary>Answer</summary>

**A.** Amazon Inspector automatically and continually scans EC2 instances, container images in ECR, and Lambda functions for known vulnerabilities (CVEs) and network reachability issues.

```diagram
*Amazon Inspector -(continuous scans)-> EC2 instances & ECR images & Lambda functions -> CVE and network exposure findings
```

Why not the others:
- **B.** Amazon Detective helps investigate the root cause of security findings. It doesn't scan for vulnerabilities.
- **C.** Security Hub aggregates findings from other services, including Inspector, but doesn't scan workloads for CVEs itself.
- **D.** GuardDuty detects threats by analyzing activity logs. It doesn't scan software packages for known CVEs.

Resource: <https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html>
</details>

**23.** A security team already receives separate findings from GuardDuty, Inspector, and Macie in three different consoles, and manually cross-references them during incident investigations using Amazon Detective. They now want one dashboard that aggregates all of those findings, adds its own checks against standards like the AWS Foundational Security Best Practices, and gives each account an overall security score. Which service should they add?
- A. AWS Trusted Advisor
- B. Amazon CloudWatch
- C. Amazon Detective
- D. AWS Security Hub

<details><summary>Answer</summary>

**D.** Security Hub aggregates findings from GuardDuty, Inspector, Macie, and other sources, runs its own automated checks against security standards, and produces an overall score per account. Detective is used for deep investigation, not aggregation or scoring.

```diagram
GuardDuty & Inspector & Macie -> *AWS Security Hub -> Security score & Standards checks
```

Why not the others:
- **A.** Trusted Advisor runs best-practice checks, but it doesn't aggregate GuardDuty, Inspector and Macie findings or score accounts against security standards.
- **B.** CloudWatch collects metrics, logs and alarms. It isn't a security findings dashboard.
- **C.** Detective is for investigating individual findings in depth. The team already uses it, and it doesn't aggregate findings or produce security scores.

Resource: <https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html>
</details>

**24.** An application already stores non-secret configuration — feature flags, log levels — in AWS Systems Manager Parameter Store standard parameters. It also connects to an Amazon RDS for MySQL database using a password that security wants rotated automatically every 30 days, with the rotation Lambda function and new credentials managed on the company's behalf rather than hand-rolled. Which service is designed for this?
- A. AWS Systems Manager Parameter Store (standard parameter)
- B. AWS KMS with automatic key rotation enabled
- C. AWS Secrets Manager with automatic rotation
- D. An S3 object encrypted with SSE-S3

<details><summary>Answer</summary>

**C.** Secrets Manager has built-in, Lambda-based rotation for RDS, Aurora, Redshift, and DocumentDB, so the team doesn't have to build the rotation logic itself.

```diagram
App -(get secret)-> *Secrets Manager -(connect)-> RDS for MySQL
*Secrets Manager -(every 30 days)-> Rotation Lambda | AWS-provided -> RDS for MySQL | new password
```

Why not the others:
- **A.** Parameter Store has no built-in automatic rotation for database passwords.
- **B.** KMS key rotation changes the key material used for encryption. It doesn't rotate a database password.
- **D.** An encrypted S3 object stores the password securely, but nothing rotates it or updates the database.

Resource: <https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html>
</details>

**25.** A three-tier application (web, app, database) is being redesigned after a penetration test found the database directly reachable from the internet through a misconfigured route table. The web tier serves a few thousand requests per minute through an ALB, and the app tier talks to the database only on port 3306. The redesign must ensure only the web tier is reachable from the internet, and only the app tier can reach the database. What is the BEST design?
- A. ALB in public subnets; app and DB in private subnets; DB security group allows only the app tier's
- B. Put all tiers in private subnets and attach one security group shared by every tier
- C. Put the database in a public subnet and protect it with a strong password and TLS
- D. Put all three tiers in public subnets and restrict traffic between them with network ACLs

<details><summary>Answer</summary>

**A.** Referencing security groups by ID (rather than IP ranges) keeps access tightly scoped tier-to-tier even as instances scale in and out, and keeping the app and database tiers out of public subnets removes them from direct internet reachability.

```diagram
Internet -> [Public subnets: ALB] -> [Private subnets: App tier -(port 3306, SG reference)-> *DB | SG allows app tier SG only]
Internet -x-> DB
```

Why not the others:
- **B.** With every tier in private subnets there's no internet-facing entry point, and one shared security group lets every tier reach the database.
- **C.** A database in a public subnet stays reachable from the internet. A strong password and TLS don't remove that exposure.
- **D.** Putting all tiers in public subnets exposes the app and database tiers. Stateless, IP-based network ACLs are also harder to manage than security group references.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html>
</details>

**26.** A mobile app's backend API on Amazon API Gateway currently has no authentication, which a pre-launch security review flagged. Users already sign in through an existing Amazon Cognito user pool that issues JWTs, and the mobile team doesn't want to implement SigV4 request signing inside the app. What is the simplest way to require a valid token on each API call?
- A. An IAM user for each client, with SigV4-signed requests
- B. A Cognito user pool authorizer on the API methods
- C. A network ACL that allows only the clients' IP addresses
- D. An AWS WAF rate-based rule attached to the API stage

<details><summary>Answer</summary>

**B.** A Cognito user pool authorizer validates the JWT on each request without requiring SigV4 signing or IAM credentials in the mobile app.

```diagram
Mobile app -(JWT from user pool)-> [API Gateway: *Cognito user pool authorizer] -> Backend
Request without valid token -x-> *Cognito user pool authorizer
```

Why not the others:
- **A.** Per-client IAM users don't scale for app users, and they require SigV4 signing in the app, which the team wants to avoid.
- **C.** API Gateway is a managed public endpoint, so network ACLs don't apply to it, and an IP address doesn't identify a signed-in user.
- **D.** A rate-based rule limits request volume per IP. It doesn't check whether the caller has a valid token.

Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html>
</details>

**27.** A company's administrators currently SSH into a bastion host in a public subnet, then hop to private EC2 instances, and just spent hours rotating SSH keys after an admin left the team. Security wants shell access to the private instances without opening port 22 anywhere, without managing SSH keys, and with every session logged for audit. What should be used?
- A. AWS Systems Manager Session Manager
- B. An Elastic IP address on each private instance
- C. EC2 Serial Console only
- D. A second, more tightly locked-down bastion host in a public subnet

<details><summary>Answer</summary>

**A.** Session Manager uses the SSM agent and IAM policies instead of SSH keys or open inbound ports, and it can log session activity to S3 or CloudWatch Logs for audit.

```diagram
Admin -(IAM-authorized session)-> *Session Manager -(SSM agent)-> [Private subnet: EC2 | no port 22 open]
*Session Manager -> Session logs | S3 or CloudWatch Logs
```

Why not the others:
- **B.** An Elastic IP makes the instances reachable from the internet and still relies on SSH keys and an open port 22.
- **C.** EC2 Serial Console is for troubleshooting boot and network problems, not a day-to-day, audited shell for administrators.
- **D.** Another bastion host still needs port 22 open and SSH keys to manage, which is what the team wants to get rid of.

Resource: <https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html>
</details>

**28.** A company manages 30 VPCs across 8 accounts and wants one central team to define firewall rules once — including stateful inspection and domain-name filtering for outbound traffic — and have those rules automatically applied to every existing and future VPC in the organization, rather than each account team maintaining its own rules. Which service is the BEST fit?
- A. Route 53 private hosted zones that override unwanted domain names
- B. Security groups in each VPC, shared across accounts through AWS RAM
- C. AWS Shield Standard applied to each VPC's internet gateway
- D. AWS Network Firewall, managed centrally with AWS Firewall Manager

<details><summary>Answer</summary>

**D.** AWS Network Firewall provides stateful inspection and domain-list filtering, and Firewall Manager can push a common policy to every account and VPC in the organization, including new ones as they're created.

```diagram
*Firewall Manager | central policy -> [Organization: VPC 1 & VPC 2 & New VPCs] -> *Network Firewall | stateful + domain filtering
```

Why not the others:
- **A.** Private hosted zones answer DNS queries for your own domains. They don't inspect or filter traffic.
- **B.** Security groups filter by IP address and port only. They can't inspect traffic statefully by content or filter by domain name.
- **C.** Shield Standard protects against DDoS attacks. It doesn't provide firewall rules or domain filtering.

Resource: <https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html>
</details>

**29.** A company's on-premises data center needs an encrypted connection to a VPC for a project that goes live in two weeks. The network team has already opened a case to order a dedicated Direct Connect circuit, but the vendor's lead time is several weeks. What should they use to get an encrypted connection running before launch?
- A. VPC peering
- B. An internet gateway
- C. AWS Site-to-Site VPN
- D. AWS Direct Connect without encryption

<details><summary>Answer</summary>

**C.** Site-to-Site VPN uses IPsec tunnels over the internet and can typically be set up within minutes to hours, unlike Direct Connect, which takes weeks to provision and isn't encrypted by default.

```diagram
On-premises network -(IPsec tunnels over the internet)-> *Site-to-Site VPN -> VPC
On-premises network ~(weeks later)~> Direct Connect -> VPC
```

Why not the others:
- **A.** VPC peering connects two VPCs. It can't connect an on-premises data center.
- **B.** An internet gateway gives a VPC internet access. It doesn't create an encrypted connection to a data center.
- **D.** Direct Connect won't be ready in time, and it isn't encrypted by default.

Resource: <https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html>
</details>

**30.** A media company migrated its private video thumbnails from a legacy setup that used an origin access identity (OAI) years ago, and now wants new distributions to use the current recommended approach, so that only its CloudFront distribution — and no one else, even someone who discovers the bucket's name — can read objects in the private S3 origin bucket. What should be configured?
- A. S3 Transfer Acceleration, with a bucket policy that requires the accelerate endpoint
- B. A public bucket policy that allows reads only from CloudFront's published IP ranges
- C. Origin access control (OAC) and a bucket policy scoped to the CloudFront service principal
- D. A pre-signed URL generated for every object and embedded in the application's web pages

<details><summary>Answer</summary>

**C.** OAC uses a bucket policy `Condition` tied to the specific distribution, so only that CloudFront distribution can read the bucket. OAC is the current recommended replacement for the legacy OAI approach.

```diagram
Viewer -> *CloudFront | OAC signs origin requests -> [Private: S3 bucket | policy allows this distribution only]
Direct request with bucket name -x-> S3 bucket
```

Why not the others:
- **A.** Transfer Acceleration speeds up transfers to and from S3. It doesn't restrict who can read the bucket.
- **B.** CloudFront's IP ranges are shared by every CloudFront customer, so any distribution could read the bucket, and the bucket would be public.
- **D.** Pre-signed URLs let anyone holding the URL read the object directly from S3. They don't limit access to CloudFront.

Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
</details>

**46.** A GuardDuty finding shows that an EC2 instance in a production account made unusual API calls at 3 AM using its IAM role's credentials. The company already aggregates findings in Security Hub and has CloudTrail enabled everywhere. Before deciding how to respond, an analyst wants to see the full context quickly: which other resources that role touched, which IP addresses were involved, and how the activity compares with the role's normal behavior over the past few weeks, without writing log queries by hand. Which service should the analyst use?
- A. Amazon Inspector, to scan the instance for software vulnerabilities
- B. Amazon Detective, to investigate the finding's related activity
- C. AWS Config, to review the instance's configuration history
- D. Amazon Macie, to check whether the instance read sensitive data

<details><summary>Answer</summary>

**B.** Detective automatically builds a behavior graph from sources such as CloudTrail, VPC Flow Logs and GuardDuty findings, so an analyst can pivot from a finding to the related roles, IP addresses and resources, and compare activity with a baseline, without writing queries.

```diagram
GuardDuty finding -> *Amazon Detective | behavior graph -> Related roles, IPs, resources & Baseline comparison
```

Why not the others:
- **A.** Inspector finds software vulnerabilities and network exposure. It doesn't show what a role or instance actually did.
- **C.** Config shows how a resource's configuration changed over time, not which API calls a role made or which IP addresses it talked to.
- **D.** Macie discovers sensitive data in S3. It doesn't investigate a role's activity across resources.

Resource: <https://docs.aws.amazon.com/detective/latest/userguide/what-is-detective.html>
</details>

**49.** An application reads about 40 configuration values at startup. Three of them are API tokens from a third-party vendor that change only when the vendor contract is renewed, roughly once a year, and an engineer updates them by hand. The team wants the tokens encrypted with AWS KMS and access-controlled with IAM, doesn't need automatic rotation, and wants the lowest-cost option. What should they use?
- A. Systems Manager Parameter Store SecureString parameters
- B. AWS Secrets Manager secrets with automatic rotation enabled
- C. Plain-text environment variables in the ECS task definition
- D. A JSON file of all the values in an S3 bucket using SSE-S3

<details><summary>Answer</summary>

**A.** SecureString parameters are encrypted with KMS and controlled with IAM, and standard-tier parameters have no additional charge. Secrets Manager adds features such as automatic rotation, but charges for each secret.

```diagram
App -(GetParameter, decrypt)-> *Parameter Store | SecureString, standard tier -> AWS KMS | encryption
Engineer -(update yearly)-> *Parameter Store | SecureString, standard tier
```

Why not the others:
- **B.** Secrets Manager charges for each secret, and automatic rotation can't help here, because the vendor issues new tokens by hand.
- **C.** Plain-text environment variables aren't encrypted with KMS, and anyone who can read the task definition can see them.
- **D.** SSE-S3 doesn't use KMS keys, and a single file gives no per-value access control.

Resource: <https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html>
</details>

**53.** After an incident in which malware on an EC2 instance reached a command-and-control server by its domain name, the security team wants to block DNS queries from its VPCs for known malicious domains, using lists that AWS maintains, before any connection is even attempted. The VPCs use the Route 53 Resolver for DNS. What should be used?
- A. Route 53 Resolver DNS Firewall with AWS managed domain lists
- B. Security group outbound rules that deny the malicious domains
- C. Network ACL rules that block the malicious domain names
- D. Amazon GuardDuty, which blocks the DNS queries it flags

<details><summary>Answer</summary>

**A.** Route 53 Resolver DNS Firewall filters DNS queries that leave your VPCs through the Resolver, and it can block domains on AWS managed lists of known malicious domains.

```diagram
EC2 -(DNS query)-> Route 53 Resolver -> *DNS Firewall | AWS managed domain lists -x(malicious domain)-> C2 server
```

Why not the others:
- **B.** Security groups allow traffic by IP address and port only. They can't have deny rules or match domain names.
- **C.** Network ACLs filter by IP address and port. They can't match domain names.
- **D.** GuardDuty detects suspicious DNS activity and reports findings, but it doesn't block queries.

Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver-dns-firewall.html>
</details>

**54.** A company wants employees to reach several internal web applications from anywhere, without first connecting to a VPN. Every request should be checked against the user's identity from the corporate identity provider and the security posture of the device they're using before it reaches the application. Which service provides this?
- A. AWS Client VPN with certificate-based authentication
- B. An internet-facing ALB with AWS WAF IP allowlists
- C. AWS Verified Access, using identity and device checks
- D. Amazon Cognito user pools in front of each application

<details><summary>Answer</summary>

**C.** Verified Access provides access to corporate applications without a VPN. It evaluates each request against policies that use identity from an identity provider and device posture from a device-management provider.

```diagram
Employee, no VPN -> *AWS Verified Access -(identity + device checks)-> Internal web apps
Corporate IdP & Device management -> *AWS Verified Access
```

Why not the others:
- **A.** Client VPN is still a VPN, and it grants network access instead of checking each request against identity and device posture.
- **B.** IP allowlists don't identify users or check device security, and employees working from anywhere have changing IP addresses.
- **D.** Cognito can authenticate users, but it doesn't check device posture, and adding it to each app means changing every application.

Resource: <https://docs.aws.amazon.com/verified-access/latest/ug/what-is-verified-access.html>
</details>

**55.** Users of a web app upload profile photos directly from their browsers to a private S3 bucket, so large uploads don't pass through the app's servers. Each user should be able to upload one object, to one specific key, within the next 10 minutes, and the bucket must stay private. What should the backend give the browser?
- A. The access keys of an IAM user with `s3:PutObject` permission
- B. A presigned URL for that object key that expires in 10 minutes
- C. A bucket policy statement allowing `s3:PutObject` from any principal
- D. A CloudFront signed cookie that allows reading the whole bucket

<details><summary>Answer</summary>

**B.** A presigned URL grants time-limited permission for one specific operation, such as uploading to one key, using the backend's own credentials, so the bucket stays private.

```diagram
Browser -(request upload)-> Backend -(signs with its own credentials)-> *Presigned URL | one key, expires in 10 min
Browser -(PUT with presigned URL)-> [Private bucket: S3 | that one key only]
```

Why not the others:
- **A.** Long-term access keys let anyone who obtains them use them indefinitely, far beyond one upload.
- **C.** Allowing any principal to put objects makes the bucket publicly writable.
- **D.** A signed cookie for reading through CloudFront doesn't allow uploads, and it covers far more than one object.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html>
</details>

**59.** A bucket holds sensitive data exports that should only ever be accessed from the company's analytics VPC, which reaches S3 through a gateway VPC endpoint. Even a user with valid credentials must be denied if the request comes from anywhere else, such as a laptop on the internet. How can this be enforced?
- A. S3 Block Public Access turned on for the bucket
- B. A bucket policy that denies requests unless `aws:SourceVpce` matches the endpoint
- C. A security group on the gateway endpoint that allows only the VPC's CIDR
- D. Default encryption with SSE-KMS and a customer managed key

<details><summary>Answer</summary>

**B.** A bucket policy can deny any request that doesn't arrive through a specific VPC endpoint by checking `aws:SourceVpce`, which blocks requests from the internet even when the caller's credentials are valid.

```diagram
[Analytics VPC: EC2] -(gateway endpoint vpce-1)-> *Bucket policy | deny unless aws:SourceVpce matches -> S3 bucket
Laptop on the internet -x(valid credentials, wrong path)-> *Bucket policy | deny unless aws:SourceVpce matches
```

Why not the others:
- **A.** Block Public Access stops public access, but authenticated users with valid credentials could still reach the bucket from anywhere.
- **C.** Gateway endpoints don't use security groups. They're targets in route tables.
- **D.** Encryption protects stored data, but anyone allowed to use the key could still read it from anywhere.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html>
</details>

**61.** A penetration test found a server-side request forgery (SSRF) flaw in a web application on EC2: an attacker could make the server fetch arbitrary URLs, including the instance metadata endpoint, and steal the instance role's temporary credentials. While developers fix the code, which change to the instances best reduces this risk?
- A. Require IMDSv2, so metadata requests need a session token
- B. Remove the instance role and embed access keys instead
- C. Move the instances to a private subnet behind a NAT gateway
- D. Turn on detailed CloudWatch monitoring for the instances

<details><summary>Answer</summary>

**A.** IMDSv2 requires a session token, obtained with a PUT request, before metadata can be read. That blocks most SSRF attacks, which can only make simple GET requests to the metadata endpoint.

```diagram
Attacker -(SSRF: simple GET)-> Web app -x-> *IMDSv2 | token required
SDK on instance -(PUT for session token, then GET)-> *IMDSv2 | token required -> Role credentials
```

Why not the others:
- **B.** Embedded access keys are long-term credentials, which are even more damaging if stolen.
- **C.** The SSRF requests come from the server itself, so a private subnet doesn't stop them reaching the metadata endpoint.
- **D.** Detailed monitoring collects metrics more often. It doesn't protect credentials.

Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html>
</details>

**63.** Lambda functions run in private subnets that have no NAT gateway, and security policy forbids adding internet access to those subnets. The functions now need to read database credentials from AWS Secrets Manager. How can they reach Secrets Manager?
- A. A gateway VPC endpoint for Secrets Manager
- B. An interface VPC endpoint for Secrets Manager
- C. A VPC peering connection to the Secrets Manager service VPC
- D. An Elastic IP address attached to each Lambda function

<details><summary>Answer</summary>

**B.** An interface endpoint (powered by AWS PrivateLink) places private network interfaces for Secrets Manager inside the VPC, so the functions reach the service over private IP addresses without any internet access.

```diagram
[Private subnet, no NAT: Lambda] -(private IP)-> *Interface endpoint | Secrets Manager -> AWS Secrets Manager
```

Why not the others:
- **A.** Gateway endpoints exist only for S3 and DynamoDB.
- **C.** AWS services can't be reached by peering with a service VPC. Private access to them goes through VPC endpoints.
- **D.** Lambda functions in a VPC can't have Elastic IP addresses, and a public address would still need the internet access the policy forbids.

Resource: <https://docs.aws.amazon.com/secretsmanager/latest/userguide/vpc-endpoint-overview.html>
</details>

**65.** A ticketing site behind CloudFront sees bursts of tens of thousands of HTTP requests per minute from a few hundred IP addresses whenever popular concert tickets go on sale, slowing the site for genuine buyers. The site already uses AWS WAF managed rules for SQL injection. What should be added to limit each abusive client automatically?
- A. AWS Shield Standard, which is already applied automatically
- B. A security group rule that limits requests per IP address
- C. A rate-based rule in the existing AWS WAF web ACL
- D. A larger origin fleet so that every request can be served

<details><summary>Answer</summary>

**C.** A WAF rate-based rule counts requests from each IP address (or another key) over a time window, and blocks or challenges clients that exceed the limit, while normal buyers are unaffected.

```diagram
Clients -> CloudFront -> [AWS WAF web ACL: *Rate-based rule | per IP per window -> Managed SQLi rules] -> Ticketing site
Abusive IPs -x(over the limit)-> *Rate-based rule | per IP per window
```

Why not the others:
- **A.** Shield Standard protects against network and transport-layer DDoS attacks, which it already does. It doesn't limit HTTP request rates.
- **B.** Security groups allow traffic by IP address and port. They can't count or limit requests.
- **D.** Scaling out raises costs and still serves the abusive traffic instead of stopping it.

Resource: <https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html>
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

```diagram
App -> S3 -(encrypt / decrypt calls)-> *KMS customer managed key | key policy controls users -> CloudTrail | logs each use
Engineer -x(removed from key policy)-> *KMS customer managed key
```

Why not the others:
- **A.** With SSE-S3, S3 manages the keys, so there's no key policy to revoke one engineer's use of the key and no per-request KMS audit trail.
- **B.** With client-side encryption, AWS never sees the key, so key usage can't be audited in CloudTrail, and it isn't server-side encryption.
- **D.** With SSE-C you supply the key with every request. AWS doesn't store it or log its use in KMS, so there's no key policy or CloudTrail key trail.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html>
</details>

**32.** A bucket using SSE-KMS handles 8,000 GET requests per second at peak, and the team's monthly AWS KMS bill has grown far larger than the S3 storage bill itself, with occasional `ThrottlingException` errors showing up in the application logs. What should be enabled to cut the number of calls made to KMS without giving up per-object encryption?
- A. Disable S3 Versioning on the bucket
- B. Switch the bucket to SSE-C
- C. Turn on S3 Transfer Acceleration
- D. Enable S3 Bucket Keys

<details><summary>Answer</summary>

**D.** A bucket-level key cuts the number of calls to KMS by up to 99% by reusing a time-limited data key for many objects, directly reducing both throttling and cost.

```diagram
S3 -(once per time window)-> *S3 Bucket Key -(encrypts many objects)-> Object data keys
S3 ~(far fewer calls)~> AWS KMS
```

Why not the others:
- **A.** Versioning keeps previous versions of objects. It has no effect on how often S3 calls KMS.
- **B.** SSE-C avoids KMS entirely, but clients must then supply and manage the key on every request, which means rewriting the application.
- **C.** Transfer Acceleration speeds up long-distance transfers. It doesn't reduce KMS calls.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-key.html>
</details>

**33.** A brokerage firm's compliance officer tells the cloud team that trade log objects must be impossible to delete or overwrite for 7 years — by anyone, including someone who somehow obtains root user credentials — to satisfy a regulatory record-keeping rule. What should be used?
- A. MFA Delete, enabled on the bucket by the root user
- B. S3 Versioning with a bucket policy that denies `s3:DeleteObject`
- C. S3 Object Lock in Governance mode with a 7-year retention period
- D. S3 Object Lock in Compliance mode with a 7-year retention period

<details><summary>Answer</summary>

**D.** In Compliance mode, no user — including the root user or an account with full administrative permissions — can shorten the retention period or delete the object before it expires. Governance mode can be bypassed by users with a special permission.

```diagram
Anyone, even root -x(delete or overwrite)-> *Object Lock Compliance mode | 7-year retention -> Trade logs
```

Why not the others:
- **A.** MFA Delete only requires MFA to delete object versions. The root user with the MFA device can still delete them, and objects can still be overwritten with new versions.
- **B.** A bucket policy can be changed or removed by the root user or an administrator, so it can't guarantee nobody deletes objects.
- **C.** Governance mode can be bypassed by users with the `s3:BypassGovernanceRetention` permission, so it doesn't stop everyone.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html>
</details>

**34.** A company already enforces TLS for every connection to its Amazon RDS for PostgreSQL instance using the `rds.force_ssl` parameter, but a new compliance requirement also calls for encryption at rest, and the instance was created two years ago without it. A short maintenance window has been approved. How can encryption at rest be added to this existing instance?
- A. Modify the instance, turn on encryption, and apply the change immediately
- B. Create an encrypted read replica and promote it to replace the primary
- C. Turn on TLS at the instance level a second time to trigger re-encryption
- D. Snapshot it, copy the snapshot with encryption on, and restore from the copy

<details><summary>Answer</summary>

**D.** Encryption at rest can only be set when an RDS instance is created, so an existing unencrypted instance must be snapshotted, the snapshot copied with encryption turned on, and a new instance restored from that encrypted copy.

```diagram
Unencrypted RDS -> Snapshot -(copy with KMS key)-> *Encrypted snapshot -(restore)-> Encrypted RDS instance
```

Why not the others:
- **A.** Encryption at rest can't be turned on for an existing unencrypted RDS instance.
- **B.** RDS doesn't allow an encrypted read replica of an unencrypted instance.
- **C.** TLS protects data in transit. It doesn't encrypt data at rest.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html>
</details>

**35.** A company's data lake in S3 has grown to thousands of objects uploaded by dozens of teams, and no one is fully sure which files contain PII such as names, national ID numbers, or payment card numbers. Which service uses machine learning to discover and classify this kind of sensitive data in S3 automatically?
- A. Amazon GuardDuty
- B. AWS Glue DataBrew
- C. Amazon Macie
- D. Amazon Comprehend Medical

<details><summary>Answer</summary>

**C.** Amazon Macie uses machine learning and pattern matching to discover, classify, and report on sensitive data such as PII stored in S3.

```diagram
S3 data lake -> *Amazon Macie | ML + pattern matching -> PII findings | names, IDs, card numbers
```

Why not the others:
- **A.** GuardDuty detects threats from activity logs. It doesn't classify the contents of S3 objects.
- **B.** DataBrew can flag PII in a dataset you profile, but it's a data-preparation tool. It doesn't automatically discover sensitive data across all of your S3 buckets.
- **D.** Comprehend Medical extracts medical information from text you send it. It doesn't scan S3 buckets for PII.

Resource: <https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html>
</details>

**36.** A company's previous TLS certificate, bought from a third-party CA and installed manually, expired unnoticed last year and caused an outage. For the new architecture — an ALB fronted by a CloudFront distribution — the team wants a public certificate that renews itself automatically, at no extra cost, for both. What should be used?
- A. A self-signed certificate uploaded to IAM
- B. AWS Certificate Manager (ACM)
- C. AWS Private Certificate Authority
- D. AWS KMS with an asymmetric key

<details><summary>Answer</summary>

**B.** ACM public certificates are free and renew automatically as long as they remain in use and DNS validation stays in place. Note that the certificate used by CloudFront must be requested in `us-east-1`.

```diagram
*ACM public certificate | free, auto-renews -> CloudFront | cert in us-east-1
*ACM public certificate | free, auto-renews -> ALB | cert in its Region
```

Why not the others:
- **A.** Browsers don't trust self-signed certificates, and certificates uploaded to IAM don't renew themselves.
- **C.** AWS Private CA issues private certificates that public browsers don't trust, and it has its own charges.
- **D.** KMS asymmetric keys are for signing and encryption. They aren't TLS certificates, and CloudFront and ALBs can't use them as one.

Resource: <https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html>
</details>

**37.** A payments company's PCI assessor requires that cryptographic keys be generated and stored in single-tenant hardware security modules validated to FIPS 140-2 Level 3, under the company's own exclusive administrative control — a shared, multi-tenant key service isn't acceptable to the assessor. Which service fits?
- A. AWS CloudHSM
- B. SSE-S3
- C. AWS KMS with AWS managed keys
- D. AWS Secrets Manager

<details><summary>Answer</summary>

**A.** CloudHSM provisions single-tenant, FIPS 140-2 Level 3 validated hardware security modules that the customer controls directly, unlike the shared infrastructure behind AWS KMS's AWS managed keys.

```diagram
App -> [Your VPC: *CloudHSM cluster | single-tenant, FIPS 140-2 Level 3] -> Keys under your exclusive control
```

Why not the others:
- **B.** SSE-S3 is S3's own server-side encryption, with keys managed entirely by S3. It doesn't give you dedicated HSMs.
- **C.** AWS managed keys live in KMS's shared, multi-tenant service, and AWS controls them, not the customer.
- **D.** Secrets Manager stores and rotates secrets. It doesn't provide dedicated hardware security modules.

Resource: <https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html>
</details>

**38.** A bucket already uses default encryption with SSE-KMS for data at rest, but a security scan flagged that it still accepts plain HTTP requests through the S3 REST API. Every request to the bucket must use HTTPS. How is this enforced?
- A. Default bucket encryption with SSE-KMS and a customer managed key
- B. A bucket policy denying requests where `aws:SecureTransport` is `false`
- C. S3 Block Public Access turned on at the account and bucket levels
- D. An S3 Access Point with a VPC network origin for every client

<details><summary>Answer</summary>

**B.** Encrypting data at rest doesn't protect data in transit. A bucket policy that denies requests when `aws:SecureTransport` is `false` forces every request to use HTTPS.

```diagram
Client -(HTTPS)-> *Bucket policy | deny if aws:SecureTransport false -> S3 bucket
Client -x(plain HTTP)-> *Bucket policy | deny if aws:SecureTransport false
```

Why not the others:
- **A.** Default encryption protects data at rest. It doesn't stop clients from using plain HTTP.
- **C.** Block Public Access prevents public access. It doesn't require HTTPS for authorized requests.
- **D.** A VPC-restricted access point limits where requests come from, not whether they use HTTPS.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>
</details>

**39.** After a new hire accidentally made a test bucket public last quarter, leadership wants a control that makes it impossible for any S3 bucket in the account — existing or newly created, no matter what bucket policy or ACL someone attaches — to ever become public by mistake. What should be enabled?
- A. S3 Versioning with MFA Delete on every bucket
- B. Server access logging with alerts on public reads
- C. S3 Block Public Access at the account level
- D. S3 Object Lock in Compliance mode on every bucket

<details><summary>Answer</summary>

**C.** S3 Block Public Access, turned on at the account level, overrides any bucket policy or ACL that would otherwise make a bucket or object public — for existing and future buckets alike.

```diagram
Bucket policy or ACL | making it public -x-> *Block Public Access | account level -> All buckets | existing and new
```

Why not the others:
- **A.** Versioning with MFA Delete protects against deletion. It doesn't stop a bucket from being made public.
- **B.** Access logs and alerts only tell you after a bucket has already been made public.
- **D.** Object Lock prevents objects from being deleted or overwritten. It doesn't control public access.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html>
</details>

**40.** A DevOps engineer needs to share an EBS snapshot, encrypted with a customer managed KMS key, with a partner's AWS account so the partner can restore it into their own VPC. The engineer shares the snapshot, but the partner's account still can't launch a volume from it. What else is required?
- A. Make the snapshot public so that the other account can copy it
- B. Copy the snapshot with the AWS managed key `aws/ebs`, then share the copy instead
- C. Nothing further; EBS in the other account decrypts customer managed keys automatically once a snapshot is shared
- D. Grant the partner account permission to use the KMS key in the key's own key policy

<details><summary>Answer</summary>

**D.** Sharing the snapshot alone isn't enough for a customer managed key: the target account also needs to be granted use of that key in its key policy before it can decrypt and restore from the snapshot. (Snapshots encrypted with the AWS managed key `aws/ebs` can't be shared across accounts at all.)

```diagram
[Your account: Encrypted snapshot & *KMS key policy | allow partner account] -(share snapshot + key)-> [Partner account: Restored EBS volume]
```

Why not the others:
- **A.** Encrypted snapshots can't be shared publicly. Only unencrypted snapshots can.
- **B.** Snapshots encrypted with the AWS managed key `aws/ebs` can't be shared with other accounts at all.
- **C.** The other account needs permission to use the customer managed key. Without it, it can't decrypt the snapshot.

Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html>
</details>

**41.** A company's backups today are a patchwork of manual RDS snapshots, an EBS snapshot lifecycle policy, and a cron job that exports DynamoDB tables, with no single view of what's actually protected. After a ransomware scare in the industry, the CISO wants automatic, policy-driven backups of EBS, RDS, DynamoDB, and EFS, copied to a second Region, with a vault lock that prevents anyone — including an administrator — from shortening retention or deleting backups early. Which service should they use?
- A. S3 Cross-Region Replication of data exported from each service
- B. AWS DataSync tasks that copy each resource's data to a second Region
- C. Lambda functions that snapshot each resource and copy it to another Region
- D. AWS Backup with backup plans, cross-Region copy, and Vault Lock

<details><summary>Answer</summary>

**D.** AWS Backup centralizes policy-driven backup across EBS, RDS, DynamoDB, EFS, and other services, supports cross-Region copy, and Vault Lock can make a vault's policy immutable — even to the account's own administrators.

```diagram
*Backup plan -> EBS & RDS & DynamoDB & EFS -> *Backup vault | Vault Lock -(cross-Region copy)-> Vault in second Region
```

Why not the others:
- **A.** Cross-Region Replication copies S3 objects only. Exporting each service's data yourself isn't a backup service, and there's no vault lock.
- **B.** DataSync moves file and object data. It doesn't back up RDS or DynamoDB, or enforce retention.
- **C.** Custom Lambda functions are exactly the patchwork the company wants to replace, and nothing stops an administrator from deleting backups early.

Resource: <https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html>
</details>

**42.** A security engineer, used to rotating database secrets in AWS Secrets Manager every 30 days, assumes AWS KMS customer managed keys rotate on the same schedule. Checking the console, they see automatic key rotation turned on with the default settings. How often does that actually rotate the key material, and can the schedule be changed?
- A. Every year (365 days) by default; the rotation period can be customized
- B. Every 30 days, matching the default Secrets Manager schedule
- C. Every 90 days, and the rotation period can't be changed
- D. Never automatically; customer managed keys can only be rotated on demand

<details><summary>Answer</summary>

**A.** Automatic rotation for a customer managed symmetric key defaults to every 365 days, and the period can be customized (AWS supports a range between 90 and 2,560 days). Old key material is retained so previously encrypted data can still be decrypted.

```diagram
Key material v1 -(365 days, default)-> Key material v2 -(customizable 90-2,560 days)-> Key material v3
Old ciphertext -(old material kept)-> *Still decryptable
```

Why not the others:
- **B.** Secrets Manager's rotation schedule has nothing to do with KMS. KMS rotates customer managed keys every 365 days by default.
- **C.** The default is every 365 days, not 90, and the period can be customized.
- **D.** Automatic rotation is available and turned on here. On-demand rotation is an additional option.

Resource: <https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html>
</details>

**43.** After an incident where an unencrypted EBS volume went unnoticed for months, a company wants a service that continuously evaluates resource configurations against rules such as "all EBS volumes must be encrypted," flags resources as noncompliant as soon as they drift, and keeps a full configuration history for every resource — not just a log of who called which API. Which service fits?
- A. AWS CloudTrail
- B. Amazon Inspector
- C. AWS Trusted Advisor
- D. AWS Config

<details><summary>Answer</summary>

**D.** AWS Config continuously records configuration changes and evaluates resources against rules like required encryption, flagging drift and keeping a configuration history — which is different from CloudTrail's record of API calls.

```diagram
Resources | e.g. EBS volumes -> *AWS Config -> Rules | encryption required -> Compliant or noncompliant
*AWS Config -> Configuration history | per resource
```

Why not the others:
- **A.** CloudTrail records API calls. It doesn't evaluate resources against rules or keep configuration history.
- **B.** Amazon Inspector scans for software vulnerabilities and network exposure. It doesn't check resource configurations against custom rules.
- **C.** Trusted Advisor runs a fixed set of best-practice checks. It doesn't evaluate custom rules continuously or keep configuration history.

Resource: <https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html>
</details>

**44.** A prospective enterprise customer's security team asks for the company's AWS SOC 2 and PCI DSS attestation reports before signing a contract. Where can the company's cloud team download these AWS compliance reports?
- A. AWS Config
- B. AWS Security Hub
- C. AWS Artifact
- D. AWS Audit Manager

<details><summary>Answer</summary>

**C.** AWS Artifact provides on-demand access to AWS's compliance reports and agreements, including SOC and PCI reports, for exactly this kind of customer due-diligence request.

```diagram
Cloud team -> *AWS Artifact | on demand -> SOC 2 & PCI DSS reports -> Prospective customer
```

Why not the others:
- **A.** AWS Config evaluates your own resources' configurations. It doesn't provide AWS's compliance reports.
- **B.** Security Hub aggregates security findings for your accounts. It doesn't provide AWS's attestation reports.
- **D.** Audit Manager helps you collect evidence for your own audits. AWS's SOC and PCI reports come from AWS Artifact.

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

```diagram
Browser -(http://)-> *HTTP listener | redirect rule -(redirect)-> Browser -(https://)-> *HTTPS listener | ACM certificate -> EC2 targets
```

Why not the others:
- **A.** SSE-S3 protects data at rest in S3. It's already on and doesn't affect browser-to-ALB traffic.
- **B.** KMS key rotation is key hygiene for data at rest. It doesn't encrypt traffic in transit.
- **D.** EBS encryption protects data at rest on the volumes. It's already on and doesn't affect client traffic.

Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html>
</details>

**47.** A fintech company must pass an annual PCI DSS assessment. Every year, engineers spend weeks taking console screenshots and exporting logs to prove that controls were in place, and the auditor still asks for more. The compliance lead wants a service that continuously and automatically collects evidence from the company's AWS accounts, maps it to PCI DSS controls using a prebuilt framework, and produces an assessment report for the auditor. What should they use?
- A. AWS Artifact, to download AWS's own PCI DSS attestation
- B. AWS Config conformance packs, reviewed by hand each year
- C. AWS Audit Manager with its prebuilt PCI DSS framework
- D. AWS Security Hub with the PCI DSS standard turned on

<details><summary>Answer</summary>

**C.** Audit Manager continuously collects evidence from sources such as AWS Config, CloudTrail and Security Hub, maps it to the controls in a framework such as PCI DSS, and generates assessment reports to share with auditors.

```diagram
AWS Config & CloudTrail & Security Hub -(evidence)-> *Audit Manager | PCI DSS framework -> Assessment report | for auditor
```

Why not the others:
- **A.** Artifact provides AWS's own compliance reports for the infrastructure AWS runs. It says nothing about the company's own controls.
- **B.** Conformance packs evaluate configuration rules, but reviewing them by hand each year is the effort the team wants to eliminate, and they don't produce an assessment report.
- **D.** Security Hub runs automated checks against PCI DSS controls, but it doesn't gather evidence from other sources into an audit-ready assessment report.

Resource: <https://docs.aws.amazon.com/audit-manager/latest/userguide/what-is.html>
</details>

**48.** A company runs 60 internal microservices on Amazon EKS that must authenticate each other using mutual TLS. The certificates are only ever used inside the company's private network, never by public browsers, and the security team wants to issue and revoke them from a managed certificate authority rather than running its own CA software on EC2. Which service should they use?
- A. AWS Certificate Manager public certificates, one for each service
- B. AWS KMS asymmetric keys, one for each microservice
- C. Self-signed certificates that each service generates at startup
- D. AWS Private Certificate Authority, issuing private certificates

<details><summary>Answer</summary>

**D.** AWS Private CA is a managed private certificate authority. It issues and revokes certificates for use inside an organization, such as mutual TLS between services, without the company running CA software itself.

```diagram
*AWS Private CA -(issue / revoke)-> Service A cert & Service B cert -> [EKS: Service A -(mutual TLS)-> Service B]
```

Why not the others:
- **A.** Public certificates are for publicly trusted domain names. Internal service identities don't need public trust, and a private CA gives the company control over issuing and revoking them.
- **B.** KMS asymmetric keys are raw keys for signing and encryption. They aren't certificates, and they have no issuance or revocation.
- **C.** Self-signed certificates have no common authority behind them, so services can't reliably verify each other or revoke a compromised certificate.

Resource: <https://docs.aws.amazon.com/privateca/latest/userguide/PcaWelcome.html>
</details>

**56.** A company replicates encrypted DynamoDB data and S3 objects from `us-east-1` to `eu-west-1` for disaster recovery. Today, data encrypted in one Region has to be decrypted and re-encrypted under a different KMS key in the other Region, which adds latency and code complexity. The team wants to decrypt data in either Region using the same key material. What should they use?
- A. A single KMS key in `us-east-1` that both Regions call
- B. Separate KMS keys with identical aliases in each Region
- C. CloudHSM clusters in each Region, with keys copied by hand
- D. AWS KMS multi-Region keys, with a replica in `eu-west-1`

<details><summary>Answer</summary>

**D.** Multi-Region keys are sets of KMS keys in different Regions that share the same key ID and key material, so data encrypted in one Region can be decrypted in another without re-encrypting it or calling across Regions.

```diagram
[us-east-1: *Primary multi-Region key -> Encrypted data] ~(same key material)~> [eu-west-1: *Replica key -> Decrypt locally]
```

Why not the others:
- **A.** Calling a key in another Region adds cross-Region latency and a dependency on `us-east-1`, which defeats the purpose of disaster recovery.
- **B.** Keys with matching aliases still have different key material, so data encrypted under one can't be decrypted with the other.
- **C.** Copying keys between CloudHSM clusters by hand is complex and error-prone, and DynamoDB and S3 encryption integrate with KMS, not directly with CloudHSM.

Resource: <https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html>
</details>

**60.** A central logging bucket receives objects uploaded by several partner accounts. Some partners uploaded objects with ACLs that left the partner as the object owner, so the logging team can't read them. The team wants the bucket owner to own every object automatically and to stop relying on ACLs altogether. What should they configure?
- A. A bucket policy that requires the `bucket-owner-full-control` ACL
- B. S3 Versioning, so that each new version belongs to the bucket owner
- C. Server access logging, to find uploads that kept the partner as owner
- D. S3 Object Ownership set to Bucket owner enforced

<details><summary>Answer</summary>

**D.** With Object Ownership set to Bucket owner enforced, ACLs are turned off and the bucket owner automatically owns every object in the bucket, whichever account uploads it.

```diagram
Partner accounts -(upload)-> *Object Ownership | Bucket owner enforced, ACLs off -> Logging bucket | owner owns every object
```

Why not the others:
- **A.** Requiring that ACL still relies on ACLs, and uploads that leave it out are rejected, which is what the team wants to move away from.
- **B.** Versioning keeps previous versions of objects. It doesn't change who owns them.
- **C.** Access logs would show which uploads caused the problem, but they don't change object ownership.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html>
</details>

**62.** After finding several unencrypted EBS volumes created by an old automation script, a company wants every new EBS volume in its account to be encrypted automatically in each Region, even when the person or tool creating it doesn't ask for encryption. What should be turned on?
- A. An AWS Config rule that flags unencrypted volumes
- B. A KMS key policy that denies unencrypted volume creation
- C. EBS encryption by default, turned on in each Region
- D. An Amazon Data Lifecycle Manager policy for the volumes

<details><summary>Answer</summary>

**C.** EBS encryption by default is a per-Region account setting. Once it's on, every new EBS volume, and every snapshot copied from an unencrypted snapshot, is encrypted automatically with the default or a chosen KMS key.

```diagram
*EBS encryption by default | per Region -> Any new volume -> Encrypted with KMS key
```

Why not the others:
- **A.** A Config rule only flags unencrypted volumes after they've been created.
- **B.** A key policy controls who can use that key. It can't stop someone creating a volume with no encryption at all.
- **D.** Data Lifecycle Manager automates snapshot and AMI schedules. It doesn't control whether new volumes are encrypted.

Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/encryption-by-default.html>
</details>
