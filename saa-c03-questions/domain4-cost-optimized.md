# Domain 4: Design Cost-Optimized Architectures (20%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html>

---

## Task 4.1: Design cost-optimized storage solutions

**1.** Objects are accessed often for 30 days, rarely for the next 60 days, and must be archived for 7 years with retrieval within 12 hours. What is the MOST cost-effective lifecycle?
- A. S3 Standard → S3 Standard-IA after 30 days → S3 Glacier Deep Archive after 90 days
- B. S3 Standard forever
- C. S3 One Zone-IA from day 1
- D. S3 Glacier Instant Retrieval from day 1

<details><summary>Answer</summary>

**A.** Standard retrieval from Deep Archive completes within 12 hours.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>
</details>

**2.** Access patterns for a data set are unknown and change over time. Which storage class optimizes cost automatically without retrieval fees?
- A. S3 Intelligent-Tiering
- B. S3 Standard-IA
- C. S3 Glacier Flexible Retrieval
- D. S3 One Zone-IA

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html>
</details>

**3.** Secondary backup copies can be recreated easily if lost and are accessed rarely. What is the cheapest option with millisecond access?
- A. S3 One Zone-IA
- B. S3 Standard
- C. S3 Standard-IA
- D. S3 Glacier Deep Archive

<details><summary>Answer</summary>

**A.** It stores data in a single AZ, so it isn't resilient to the loss of that AZ.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**4.** Medical images are rarely accessed (about once a quarter) but must be available in milliseconds when requested. Which class fits?
- A. S3 Glacier Instant Retrieval
- B. S3 Glacier Flexible Retrieval
- C. S3 Glacier Deep Archive
- D. S3 Standard

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**5.** A bucket with versioning enabled is growing fast because of old versions. How are costs controlled?
- A. A lifecycle rule to expire noncurrent versions after N days, and to abort incomplete multipart uploads
- B. Disable versioning, which deletes old versions
- C. Enable Object Lock
- D. Use Transfer Acceleration

<details><summary>Answer</summary>

**A.** Suspending versioning doesn't delete the versions that already exist.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html>
</details>

**6.** Which S3 tool gives organization-wide visibility into storage usage and cost-optimization recommendations?
- A. S3 Storage Lens
- B. S3 Inventory only
- C. CloudTrail
- D. Macie

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html>
</details>

**7.** A company has many gp2 volumes. What change usually lowers cost by about 20% while keeping or improving performance?
- A. Migrate to gp3 with Elastic Volumes (no downtime)
- B. Migrate to io2
- C. Migrate to instance store
- D. Take more snapshots

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/requesting-ebs-volume-modifications.html>
</details>

**8.** A company keeps EBS snapshots for compliance that are rarely restored and must be kept for a year. How can storage costs be cut?
- A. Move the snapshots to EBS Snapshots Archive
- B. Delete them
- C. Copy them to another Region
- D. Convert them to AMIs

<details><summary>Answer</summary>

**A.** Archive storage is up to 75% cheaper, with a minimum of 90 days and restores that take 24–72 hours.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-archive.html>
</details>

**9.** An EFS file system holds many files that are rarely accessed after 30 days. What reduces cost?
- A. EFS lifecycle management to move files to EFS Infrequent Access or Archive
- B. Switch to EBS
- C. Enable Provisioned Throughput
- D. Use Max I/O mode

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/efs/latest/ug/lifecycle-management-efs.html>
</details>

**10.** A company wants to replace physical tape backups with a cloud option without changing its backup software. What should it use?
- A. AWS Storage Gateway, Tape Gateway (virtual tapes stored in S3 and S3 Glacier)
- B. S3 File Gateway
- C. AWS DataSync
- D. Amazon EFS

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html>
</details>

---

## Task 4.2: Design cost-optimized compute solutions

**11.** A fault-tolerant, stateless batch workload can be interrupted and restarted. Which purchasing option is cheapest?
- A. Spot Instances (up to 90% off On-Demand)
- B. On-Demand
- C. Dedicated Hosts
- D. Reserved Instances for 3 years on a workload that runs 1 hour a month

<details><summary>Answer</summary>

**A.** Spot Instances get a 2-minute interruption notice.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html>
</details>

**12.** A company runs steady 24/7 workloads on EC2, Fargate, and Lambda and wants a flexible commitment discount that applies across instance families and Regions. What should it buy?
- A. Compute Savings Plans
- B. EC2 Instance Savings Plans
- C. Standard Reserved Instances
- D. Spot Instances

<details><summary>Answer</summary>

**A.** EC2 Instance Savings Plans give a higher discount but are locked to one instance family in one Region.
Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html>
</details>

**13.** A company must reserve EC2 capacity in a specific AZ for a two-week event, without a long-term commitment. What should it use?
- A. On-Demand Capacity Reservations
- B. Standard Reserved Instances (3-year)
- C. Spot blocks
- D. Savings Plans

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html>
</details>

**14.** Licensing requires per-socket or per-core visibility on physical servers (BYOL). Which option fits?
- A. Dedicated Hosts
- B. Dedicated Instances
- C. Spot Instances
- D. Shared tenancy

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html>
</details>

**15.** A web tier has a steady baseline plus unpredictable peaks. What is the most cost-effective Auto Scaling group design?
- A. A mixed instances policy: On-Demand (covered by Savings Plans) for the baseline and Spot for the peaks, spread across several instance types
- B. All On-Demand at peak size
- C. All Spot with a single instance type
- D. Dedicated Hosts

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html>
</details>

**16.** Which change can improve price-performance by up to 40% for many Linux workloads with little effort?
- A. Move to AWS Graviton (Arm-based) instances
- B. Move to Dedicated Hosts
- C. Use larger x86 instances
- D. Use instance store

<details><summary>Answer</summary>

**A.**
Resource: <https://aws.amazon.com/ec2/graviton/>
</details>

**17.** Development and test EC2 instances run 24/7 but are used only during business hours. What is an easy cost reduction?
- A. Stop them outside business hours (Instance Scheduler on AWS or scheduled Auto Scaling actions)
- B. Buy 3-year RIs
- C. Move them to Dedicated Hosts
- D. Increase their size

<details><summary>Answer</summary>

**A.**
Resource: <https://aws.amazon.com/solutions/implementations/instance-scheduler-on-aws/>
</details>

**18.** A lightly used internal API runs on two always-on EC2 instances and gets a few thousand requests a day. What is likely the MOST cost-effective re-architecture?
- A. API Gateway + Lambda (pay per request)
- B. Larger EC2 instances
- C. Reserved Instances
- D. ECS on EC2 with 4 tasks

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>
</details>

**19.** Which tool identifies idle and underused resources, such as low-utilization EC2 instances and unassociated Elastic IPs, as cost checks?
- A. AWS Trusted Advisor
- B. AWS Artifact
- C. Amazon Inspector
- D. AWS X-Ray

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html>
</details>

**20.** A company wants alerts when forecast monthly spend will exceed $10,000. What should it use?
- A. AWS Budgets with a forecast-based alert
- B. AWS Cost Explorer only
- C. CloudTrail
- D. AWS Config

<details><summary>Answer</summary>

**A.** AWS Cost Anomaly Detection catches unusual spikes that fixed thresholds miss.
Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>
</details>

**21.** Finance needs to allocate AWS costs to departments. What must be done?
- A. Apply and activate cost allocation tags (and/or use separate accounts with consolidated billing)
- B. Use IAM groups
- C. Enable VPC Flow Logs
- D. Use separate Regions

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html>
</details>

**22.** Which AWS Organizations feature lets accounts combine usage to reach volume pricing tiers and share RI and Savings Plans discounts?
- A. Consolidated billing
- B. SCPs
- C. Tag policies
- D. Delegated administrator

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html>
</details>

---

## Task 4.3: Design cost-optimized database solutions

**23.** A DynamoDB table has predictable, steady traffic. Which capacity mode is usually cheaper?
- A. Provisioned capacity with auto scaling (plus reserved capacity)
- B. On-demand
- C. Global tables
- D. DAX

<details><summary>Answer</summary>

**A.** On-demand is best for unknown or spiky traffic.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html>
</details>

**24.** A DynamoDB table holds large amounts of rarely read historical items. Which option lowers storage cost?
- A. The DynamoDB Standard-Infrequent Access table class, or TTL plus export to S3
- B. Global tables
- C. DAX
- D. Increase the RCUs

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html>
</details>

**25.** Session records in DynamoDB should be deleted automatically after 24 hours, at no cost for the deletes. What should be used?
- A. Time to Live (TTL)
- B. A Lambda cron job that deletes items
- C. DynamoDB Streams
- D. PITR

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html>
</details>

**26.** A production RDS database runs 24/7 at a stable size for the next three years. How should cost be minimized?
- A. Buy RDS Reserved Instances (or Database Savings Plans where available)
- B. Use Spot Instances for RDS
- C. Keep it On-Demand
- D. Stop it every night

<details><summary>Answer</summary>

**A.** Spot isn't available for RDS.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html>
</details>

**27.** A development RDS database is used only 8 hours a day. What is a simple cost saving?
- A. Stop the instance when it isn't in use (it restarts automatically after 7 days if left stopped)
- B. Enable Multi-AZ
- C. Add read replicas
- D. Increase storage

<details><summary>Answer</summary>

**A.** Alternatively, use Aurora Serverless v2, which can scale down to 0 ACUs.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html>
</details>

**28.** A company is migrating from Oracle on premises to reduce licensing costs, and it's willing to change engines. Which tools help?
- A. The AWS Schema Conversion Tool (or DMS Schema Conversion) with AWS DMS, targeting Aurora PostgreSQL
- B. AWS DataSync
- C. AWS Snowball only
- D. AWS Application Migration Service

<details><summary>Answer</summary>

**A.** This is a heterogeneous migration.
Resource: <https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html>
</details>

**29.** Read-heavy traffic forces the team to keep scaling up an expensive RDS instance. What is often cheaper?
- A. Add ElastiCache in front for frequently read data, or add read replicas
- B. Move to a larger instance
- C. Switch to Provisioned IOPS
- D. Enable Multi-AZ

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html>
</details>

**30.** Which RDS storage feature scales storage up automatically when free space runs low, so you don't over-provision?
- A. RDS storage autoscaling
- B. Aurora Backtrack
- C. RDS Proxy
- D. Performance Insights

<details><summary>Answer</summary>

**A.** Aurora storage grows automatically.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.Autoscaling.html>
</details>

**31.** An I/O-heavy Aurora workload has I/O charges above 25% of its Aurora bill. Which configuration can lower total cost?
- A. Aurora I/O-Optimized
- B. Aurora Standard
- C. Multi-AZ RDS
- D. Aurora Backtrack

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html#aurora-storage-type>
</details>

**32.** Infrequent analytics over years of S3 log data are run on an always-on Redshift cluster. What is cheaper?
- A. Query the data in place with Athena or Redshift Spectrum, or use Redshift Serverless
- B. A larger Redshift cluster
- C. Load the data into RDS
- D. Use DynamoDB scans

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html>
</details>

---

## Task 4.4: Design cost-optimized network architectures

**33.** Private instances send large volumes of data to S3 through a NAT gateway, and NAT data processing charges are high. What is the MOST cost-effective fix?
- A. Add an S3 gateway VPC endpoint
- B. Add a second NAT gateway
- C. Use an internet gateway for private subnets
- D. Use Transfer Acceleration

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html>
</details>

**34.** Which data transfer is generally FREE?
- A. Inbound data transfer from the internet into AWS
- B. Data transfer from EC2 to the internet
- C. Cross-Region data transfer
- D. Cross-AZ data transfer between EC2 instances

<details><summary>Answer</summary>

**A.** Cross-AZ traffic is charged in each direction. Traffic within the same AZ over private IP addresses is free.
Resource: <https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer>
</details>

**35.** A chatty application tier and its cache sit in different AZs and exchange TBs of data each month. How can cost be reduced while keeping HA in mind?
- A. Use AZ-aware routing so clients prefer resources in the same AZ, while keeping multi-AZ capacity for failover
- B. Put everything in a single AZ with no failover
- C. Use public IP addresses
- D. Use a NAT gateway

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/plan-for-data-transfer.html>
</details>

**36.** Serving static assets from S3 directly to global users costs a lot in data transfer out. What lowers cost and latency?
- A. Put CloudFront in front of S3 (S3-to-CloudFront transfer is free, and CloudFront egress is typically cheaper)
- B. Enable S3 Transfer Acceleration
- C. Replicate to every Region
- D. Use Requester Pays for public users

<details><summary>Answer</summary>

**A.**
Resource: <https://aws.amazon.com/cloudfront/pricing/>
</details>

**37.** A company transfers hundreds of TB per month between its data center and AWS over VPN. Which option usually lowers data transfer cost and improves consistency?
- A. AWS Direct Connect (lower data-transfer-out rates)
- B. More VPN tunnels
- C. VPC peering
- D. Global Accelerator

<details><summary>Answer</summary>

**A.**
Resource: <https://aws.amazon.com/directconnect/pricing/>
</details>

**38.** A company has 20 VPCs, and every one has its own NAT gateways. How can NAT costs be reduced?
- A. Centralize egress in a shared egress VPC through Transit Gateway (weighing TGW processing charges against NAT hourly savings)
- B. Add more NAT gateways
- C. Use internet gateways in private subnets
- D. Replace NAT with VPC peering

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/centralized-egress-to-internet.html>
</details>

**39.** Which item can incur charges even when it isn't doing any work?
- A. Public IPv4 addresses (including unattached Elastic IPs) and idle NAT gateways (hourly charge)
- B. Security groups
- C. Route tables
- D. Gateway VPC endpoints

<details><summary>Answer</summary>

**A.** AWS charges for all public IPv4 addresses.
Resource: <https://aws.amazon.com/vpc/pricing/>
</details>

**40.** Which statement about VPC peering versus Transit Gateway costs is CORRECT?
- A. VPC peering has no hourly charge (only data transfer), while Transit Gateway charges per attachment-hour plus per GB processed; peering can be cheaper for a few high-traffic VPC pairs
- B. Transit Gateway is always free
- C. VPC peering charges per attachment-hour
- D. Both are free

<details><summary>Answer</summary>

**A.**
Resource: <https://aws.amazon.com/transit-gateway/pricing/>
</details>
