# Domain 4: Design Cost-Optimized Architectures (20%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html>

---

## Task 4.1: Design cost-optimized storage solutions

**1.** An insurance company's claim documents are accessed frequently for the first 30 days while a claim is active, rarely touched for the next 60 days during appeals, and then must be archived for 7 years total to satisfy a state retention law — with retrieval allowed to take up to 12 hours if it's ever needed. What is the MOST cost-effective lifecycle?
- A. S3 Standard for 30 days → S3 Glacier Flexible Retrieval for the rest of the 7 years
- B. S3 Standard → S3 Standard-IA after 30 days → S3 Glacier Deep Archive after 90 days
- C. S3 Glacier Instant Retrieval from day 1 → S3 Glacier Deep Archive after 90 days
- D. S3 One Zone-IA from day 1 → S3 Glacier Flexible Retrieval after 90 days

<details><summary>Answer</summary>

**B.** Standard retrieval from Deep Archive completes within 12 hours, which meets the requirement at the lowest storage cost for data that's rarely needed after 90 days.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>
</details>

**2.** A media company ingests user-generated content whose access patterns are impossible to predict — some clips go viral within hours, others are never watched again — and access can shift unpredictably over a file's life. Leadership wants a storage class that automatically optimizes cost without anyone monitoring it, and without retrieval fees when access patterns change. Which fits?
- A. S3 Glacier Flexible Retrieval
- B. S3 One Zone-IA
- C. S3 Standard-IA
- D. S3 Intelligent-Tiering

<details><summary>Answer</summary>

**D.** S3 Intelligent-Tiering automatically moves objects between access tiers based on observed usage, with no retrieval fees, which is exactly suited to unpredictable, changing access patterns.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html>
</details>

**3.** A company's secondary backup copies can be regenerated easily from the primary source if lost, are accessed rarely, but still need millisecond access on the rare occasion someone needs one. What is the cheapest storage class that still gives millisecond access?
- A. S3 One Zone-IA
- B. S3 Glacier Deep Archive
- C. S3 Standard
- D. S3 Standard-IA

<details><summary>Answer</summary>

**A.** One Zone-IA is the cheapest class with millisecond access, and storing data in a single AZ is an acceptable trade-off here since the backup copy can simply be regenerated if that AZ is lost.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**4.** A hospital's diagnostic images are, on average, only pulled up about once a quarter after the initial diagnosis, but when a doctor does request one during a follow-up visit, it must load in milliseconds, not hours. Which storage class fits?
- A. S3 Standard
- B. S3 Glacier Flexible Retrieval
- C. S3 Glacier Instant Retrieval
- D. S3 Glacier Deep Archive

<details><summary>Answer</summary>

**C.** Glacier Instant Retrieval is priced for infrequently accessed data (like quarterly access) but still returns objects with millisecond latency, unlike Glacier Flexible Retrieval or Deep Archive, which involve a retrieval wait.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**5.** A bucket with versioning enabled — originally turned on so a bad deploy could always be rolled back — has quietly grown to several times its expected size because old versions of frequently updated files are never removed. How should costs be controlled going forward?
- A. A lifecycle rule that expires noncurrent versions after N days
- B. Suspend versioning on the bucket, which removes the old versions
- C. Turn on S3 Object Lock in Governance mode for the bucket
- D. Turn on S3 Intelligent-Tiering for the current versions only

<details><summary>Answer</summary>

**A.** A lifecycle rule that expires noncurrent versions removes old versions after a set number of days while keeping rollback ability for recent changes. Suspending versioning stops new versions but doesn't delete versions that already exist.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html>
</details>

**6.** A company with 40 AWS accounts and hundreds of S3 buckets wants one place that shows storage usage trends and cost-optimization recommendations across the whole organization, rather than checking each bucket's metrics individually. Which S3 tool gives that?
- A. S3 Inventory reports
- B. S3 Storage Lens
- C. Amazon Macie
- D. AWS CloudTrail data events

<details><summary>Answer</summary>

**B.** S3 Storage Lens provides organization-wide visibility into storage usage and activity metrics, along with cost-optimization recommendations, across every account and bucket in scope.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html>
</details>

**7.** A cost review flags dozens of gp2 volumes across the fleet that were provisioned years ago and never revisited. The team wants a low-risk change (no downtime) that usually lowers cost by about 20% while keeping or improving performance. What should they do?
- A. Migrate them to gp3 with Elastic Volumes
- B. Convert them to st1 Throughput Optimized HDD
- C. Move the data to instance store volumes
- D. Migrate them to io2 with the same IOPS

<details><summary>Answer</summary>

**A.** gp3 is roughly 20% cheaper per GB than gp2 while matching or beating its baseline performance, and Elastic Volumes changes the volume type without downtime.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/requesting-ebs-volume-modifications.html>
</details>

**8.** A company keeps a year's worth of EBS snapshots purely to satisfy a compliance requirement — they're almost never restored, and the team can tolerate a 24-to-72-hour wait on the rare occasion one is needed. How can storage costs for these snapshots be cut?
- A. Convert the snapshots to AMIs, which are stored at no charge
- B. Move the snapshots to the EBS Snapshots Archive tier
- C. Move the snapshots to S3 Glacier Deep Archive with a lifecycle rule
- D. Copy the snapshots to a cheaper Region and delete the originals

<details><summary>Answer</summary>

**B.** The EBS Snapshots Archive tier is up to 75% cheaper than standard snapshot storage, with a minimum 90-day storage duration and restores that take 24–72 hours — matching this exact access pattern.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-archive.html>
</details>

**9.** An EFS file system used by a content-management system holds millions of files, most of which are barely touched 30 days after upload, but the team doesn't want to build and maintain a separate archival process by hand. What reduces cost automatically?
- A. Switch the file system to Max I/O performance mode
- B. Switch the file system to Provisioned Throughput mode
- C. EFS lifecycle management to the IA or Archive class
- D. Move the data to gp3 EBS volumes attached to each instance

<details><summary>Answer</summary>

**C.** EFS lifecycle management automatically moves files that haven't been accessed for a configurable period into the lower-cost IA or Archive storage classes, with no application changes needed.
Resource: <https://docs.aws.amazon.com/efs/latest/ug/lifecycle-management-efs.html>
</details>

**10.** A company's backup software has supported physical tape libraries for over a decade, and rewriting the backup jobs to target a different kind of storage isn't on the roadmap this year — but it wants to get rid of the physical tape hardware itself. What should it use?
- A. Amazon EFS with the EFS Archive class
- B. AWS Storage Gateway Tape Gateway
- C. AWS Storage Gateway S3 File Gateway
- D. AWS DataSync with a daily scheduled task

<details><summary>Answer</summary>

**B.** Tape Gateway presents a virtual tape library that existing backup software can keep using unchanged, while the tapes themselves are actually stored in S3 and S3 Glacier.
Resource: <https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html>
</details>

---

## Task 4.2: Design cost-optimized compute solutions

**11.** A research team runs a fault-tolerant batch simulation that checkpoints its progress and can be interrupted and restarted from the last checkpoint without losing meaningful work. Cost matters far more than guaranteed availability for this particular workload. Which purchasing option is cheapest?
- A. Spot Instances
- B. Dedicated Hosts
- C. On-Demand Instances
- D. 3-year Reserved Instances

<details><summary>Answer</summary>

**A.** Spot Instances can cost up to 90% less than On-Demand and come with a 2-minute interruption notice, which a checkpointing, fault-tolerant workload can absorb easily.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html>
</details>

**12.** A company runs steady 24/7 workloads spread across EC2, Fargate, and Lambda, and its architecture team expects to shift instance families — and possibly Regions — over the next year as they modernize. They want a commitment discount flexible enough to follow that. What should they buy?
- A. Spot Instances
- B. EC2 Instance Savings Plans
- C. Compute Savings Plans
- D. Standard Reserved Instances

<details><summary>Answer</summary>

**C.** Compute Savings Plans apply automatically across instance families, Regions, and compute services (EC2, Fargate, Lambda), unlike EC2 Instance Savings Plans, which give a higher discount but lock in one instance family in one Region.
Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html>
</details>

**13.** A conference organizer must guarantee EC2 capacity in a specific Availability Zone for a two-week trade show, but doesn't want any multi-year commitment for capacity it will only need twice a year. What should it use?
- A. On-Demand Capacity Reservations
- B. Standard Reserved Instances (3-year)
- C. Compute Savings Plans (1-year)
- D. Spot Instances with a maximum price

<details><summary>Answer</summary>

**A.** On-Demand Capacity Reservations reserve capacity in a specific AZ for as long as needed, with no long-term commitment — you simply pay the On-Demand rate while the reservation is active.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html>
</details>

**14.** A company is bringing its own Windows Server and SQL Server licenses (BYOL) to AWS, and the licensing terms require visibility into the exact physical sockets and cores the software runs on. Which option fits?
- A. Dedicated Instances
- B. Shared tenancy
- C. Spot Instances
- D. Dedicated Hosts

<details><summary>Answer</summary>

**D.** Dedicated Hosts give visibility into, and control over, the specific physical server (including sockets and cores), which is what per-socket or per-core BYOL licensing terms typically require. Dedicated Instances only guarantee single-tenant hardware, without that visibility.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html>
</details>

**15.** A web tier has a steady baseline of traffic around the clock, plus unpredictable peaks a few times a day that last only a few minutes. The team wants to avoid provisioning for the peak load all day. What is the most cost-effective Auto Scaling group design?
- A. All Spot Instances of a single instance type, sized for the peak
- B. All On-Demand Instances, sized for the peak and running around the clock
- C. Dedicated Hosts for the baseline and On-Demand Instances for the peaks
- D. Mixed instances: Savings Plans-covered On-Demand baseline, Spot for the peaks

<details><summary>Answer</summary>

**D.** Covering the predictable baseline with discounted, committed On-Demand capacity and bursting onto cheaper Spot Instances for short, unpredictable peaks avoids paying peak-sized On-Demand rates around the clock.
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html>
</details>

**16.** An engineering team wants a change that can improve price-performance by up to 40% for many of their Linux workloads, without a major re-architecture — just a rebuild and redeploy for compatible workloads. Which change fits?
- A. Move to instances with NVMe instance store volumes
- B. Move to AWS Graviton (Arm-based) instances
- C. Move to larger x86 instances and consolidate workloads
- D. Move to Dedicated Hosts with the same instance type

<details><summary>Answer</summary>

**B.** AWS Graviton instances often deliver up to 40% better price-performance than comparable x86 instances for compatible Linux workloads, typically requiring just a rebuild for the Arm architecture.
Resource: <https://aws.amazon.com/ec2/graviton/>
</details>

**17.** Development and test EC2 instances currently run 24/7, but the engineering team only actually uses them roughly 9 AM to 6 PM on weekdays. What is an easy way to cut cost without changing the instances themselves?
- A. Resize them to a larger type so work finishes sooner
- B. Move them to Dedicated Hosts to reduce the licensing cost
- C. Buy 3-year Reserved Instances that cover all of the instances
- D. Stop them outside business hours with Instance Scheduler on AWS

<details><summary>Answer</summary>

**D.** Stopping instances outside business hours (through Instance Scheduler on AWS, or scheduled Auto Scaling actions for instances in an ASG) avoids paying for the roughly two-thirds of the day they sit unused.
Resource: <https://docs.aws.amazon.com/solutions/latest/instance-scheduler-on-aws/solution-overview.html>
</details>

**18.** A lightly used internal API currently runs on two always-on EC2 instances just in case traffic spikes, but logs show it actually gets only a few thousand requests a day, mostly during business hours. What is likely the MOST cost-effective re-architecture?
- A. An EC2 Auto Scaling group with a minimum of four instances
- B. Amazon ECS on EC2 with four tasks across two instances
- C. Amazon API Gateway with AWS Lambda functions
- D. Larger EC2 instances behind an Application Load Balancer

<details><summary>Answer</summary>

**C.** At a few thousand requests a day, paying per request and per millisecond of execution with API Gateway and Lambda costs far less than keeping any number of EC2 instances running around the clock.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>
</details>

**19.** After a surprising bill last month, a company wants a single tool that flags idle and underused resources across the account — low-utilization EC2 instances, unassociated Elastic IPs, and similar waste — as part of routine cost checks. Which tool does this?
- A. AWS Artifact reports
- B. AWS X-Ray
- C. AWS Trusted Advisor
- D. Amazon Inspector

<details><summary>Answer</summary>

**C.** Trusted Advisor's cost optimization checks specifically flag things like low-utilization EC2 instances and unassociated Elastic IP addresses, among other waste indicators.
Resource: <https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html>
</details>

**20.** Finance wants an automatic alert the moment AWS's own forecast shows this month's spend is on track to exceed $10,000, rather than waiting to find out at the end of the month. What should it use?
- A. An AWS CloudTrail trail with Insights events
- B. AWS Cost Explorer with a saved report
- C. An AWS Config rule that checks instance types
- D. AWS Budgets with a forecast-based alert

<details><summary>Answer</summary>

**D.** AWS Budgets can alert based on forecasted spend, not just actual spend so far, which is exactly what's needed to get ahead of a projected overage. (AWS Cost Anomaly Detection is the complementary tool for catching unusual spikes that a fixed threshold might miss.)
Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>
</details>

**21.** Finance wants to see exactly how much of the AWS bill each of the company's five product teams is responsible for, using the single shared account they all deploy into. What must be done?
- A. Enable VPC Flow Logs and add up the traffic by department
- B. Apply and activate cost allocation tags, or use separate accounts
- C. Put each department's users in its own IAM group
- D. Deploy each department's resources in a separate Region

<details><summary>Answer</summary>

**B.** Cost allocation tags, once applied to resources and activated in Billing, let costs be broken out by tag value (such as team or department) in Cost Explorer and billing reports. Separate accounts under consolidated billing achieve the same split cleanly if the teams are split that way instead.
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html>
</details>

**22.** A company's 15 AWS accounts, each billed separately today, individually fall short of the usage thresholds needed to reach volume pricing tiers, and none of them can fully use the Reserved Instances or Savings Plans another account purchased. Which AWS Organizations feature fixes both problems?
- A. Tag policies
- B. Service control policies
- C. Consolidated billing
- D. Delegated administrator

<details><summary>Answer</summary>

**C.** Consolidated billing combines usage across member accounts so the organization can reach volume pricing tiers together, and it shares Reserved Instance and Savings Plans discounts across accounts by default.
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html>
</details>

---

## Task 4.3: Design cost-optimized database solutions

**23.** A DynamoDB table backing a well-established internal tool has predictable, steady traffic that barely changes week to week. Which capacity mode is usually cheaper for this table?
- A. Provisioned capacity with auto scaling
- B. Global tables with on-demand capacity
- C. On-demand capacity
- D. Provisioned capacity fixed at twice the average load

<details><summary>Answer</summary>

**A.** For predictable, steady traffic, provisioned capacity (with auto scaling to absorb small variations, and reserved capacity for further savings) is usually cheaper than on-demand, which is priced for unknown or spiky traffic.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html>
</details>

**24.** A DynamoDB table holds years of historical order records that are rarely read but must stay queryable, and storage cost for the table — not throughput — has become the dominant line item. Which option lowers storage cost?
- A. DynamoDB Accelerator (DAX) in front of the table
- B. The DynamoDB Standard-Infrequent Access table class
- C. Global tables with a replica in a lower-cost Region
- D. More read capacity units provisioned on the table

<details><summary>Answer</summary>

**B.** The Standard-IA table class lowers per-GB storage price in exchange for a somewhat higher per-request cost, which is the right trade-off for large amounts of rarely read data. (For data that's rarely needed at all, TTL plus export to S3 is another option.)
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html>
</details>

**25.** Session records in a DynamoDB table should disappear automatically 24 hours after they're written, and the team specifically wants this cleanup to consume no write capacity and cost nothing extra. What should be used?
- A. A Lambda cron job that deletes items
- B. DynamoDB Streams
- C. Time to Live (TTL)
- D. Point-in-time recovery

<details><summary>Answer</summary>

**C.** TTL deletes expired items in the background at no additional cost and without consuming write capacity, unlike a Lambda job that would call `DeleteItem` and consume write capacity for every deletion.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html>
</details>

**26.** A production RDS database is expected to run 24/7 at a stable size for the next three years, based on a signed multi-year contract with the business unit it supports. How should cost be minimized?
- A. Run the database on Spot Instances through Amazon RDS
- B. Move it to RDS Custom so that Spot pricing applies
- C. Keep it On-Demand and scale the instance down at night
- D. Buy RDS Reserved Instances or a Database Savings Plan

<details><summary>Answer</summary>

**D.** For a stable, long-term commitment, RDS Reserved Instances or a Database Savings Plan give a substantial discount over On-Demand. Spot pricing isn't available for RDS in any form.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html>
</details>

**27.** A development RDS database is used only about 8 hours a day, Monday through Friday, by a small team in one time zone. What is a simple cost saving?
- A. Stop the instance when it isn't in use
- B. Increase allocated storage to raise baseline IOPS
- C. Enable Multi-AZ to spread the cost across AZs
- D. Add read replicas and shrink the primary instance

<details><summary>Answer</summary>

**A.** Stopping the instance outside business hours avoids paying for compute during the roughly two-thirds of the week it sits idle. (A stopped RDS instance restarts automatically after 7 days; Aurora Serverless v2, which can scale down to 0 ACUs, is another option for this pattern.)
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html>
</details>

**28.** A company is migrating off Oracle on-premises specifically to escape its licensing costs, and is willing to change database engines entirely rather than just move Oracle as-is. Which tools help with this kind of migration?
- A. AWS Snowball Edge to ship the Oracle database files to Amazon S3
- B. AWS SCT (or DMS Schema Conversion) with AWS DMS, targeting Aurora PostgreSQL
- C. AWS Application Migration Service to rehost the Oracle servers on EC2
- D. AWS DataSync to copy the Oracle data files into Amazon RDS for Oracle

<details><summary>Answer</summary>

**B.** This is a heterogeneous migration (different source and target engines). The Schema Conversion Tool converts the Oracle schema and code to Aurora PostgreSQL, and DMS migrates and can continuously replicate the data.
Resource: <https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html>
</details>

**29.** Read-heavy traffic keeps forcing the team to scale up an already-expensive RDS instance class every few months, and finance has started asking pointed questions about the trend. What is often cheaper than continuing to scale up?
- A. Move to a larger instance class with more memory
- B. Cache hot data in ElastiCache, or add read replicas
- C. Enable Multi-AZ so the standby serves the reads
- D. Switch the storage to Provisioned IOPS (io2) volumes

<details><summary>Answer</summary>

**B.** Offloading hot reads to ElastiCache or spreading them across read replicas addresses the actual read-heavy bottleneck directly, often far more cheaply than repeatedly scaling up the primary instance class.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html>
</details>

**30.** A team keeps manually bumping up allocated storage on an RDS instance every time free space runs low, usually over-provisioning "just in case" to avoid doing it again soon. Which RDS storage feature would handle this automatically instead?
- A. RDS Proxy connection pooling
- B. RDS storage autoscaling
- C. Performance Insights
- D. Aurora Backtrack

<details><summary>Answer</summary>

**B.** RDS storage autoscaling increases allocated storage automatically when free space runs low, removing the need to over-provision "just in case." (Aurora's storage grows automatically by design and doesn't need this feature.)
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.Autoscaling.html>
</details>

**31.** An I/O-heavy Aurora workload's monthly bill shows I/O charges running above 25% of the total Aurora cost, and that share keeps growing as traffic increases. Which configuration can lower the total cost?
- A. Aurora Standard
- B. Aurora Backtrack
- C. Aurora I/O-Optimized
- D. RDS for MySQL with gp3 storage

<details><summary>Answer</summary>

**C.** Aurora I/O-Optimized removes per-I/O charges in exchange for a higher instance and storage price, which becomes cheaper overall once I/O costs pass roughly 25% of the Aurora bill.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html#aurora-storage-type>
</details>

**32.** A company runs infrequent, ad hoc analytics — maybe a few queries a week — over years of S3 log data, but keeps an always-on Redshift cluster running just in case someone needs to run a query. What is cheaper?
- A. Query the data in place in S3 with Amazon Athena
- B. Import the logs into DynamoDB and run a scan for each analysis
- C. Resize the cluster to larger RA3 nodes so queries finish sooner
- D. Load the logs into Amazon RDS for PostgreSQL and query them there

<details><summary>Answer</summary>

**A.** Athena runs pay-per-query SQL directly against the S3 data with nothing to keep running between queries, avoiding the cost of an always-on cluster for infrequent access. (Redshift Spectrum or Redshift Serverless are other ways to avoid paying for idle cluster time.)
Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html>
</details>

---

## Task 4.4: Design cost-optimized network architectures

**33.** Private EC2 instances send large volumes of data to S3 through a NAT gateway every day, and NAT gateway data-processing charges have become one of the largest line items on the VPC's bill. What is the MOST cost-effective fix?
- A. Add an S3 gateway VPC endpoint
- B. Use Transfer Acceleration
- C. Add a second NAT gateway
- D. Use an internet gateway for private subnets

<details><summary>Answer</summary>

**A.** An S3 gateway VPC endpoint routes traffic to S3 without going through the NAT gateway at all, and it's free to use, eliminating the NAT data-processing charge for that traffic.
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html>
</details>

**34.** A billing analyst reviewing a confusing invoice wants to know which of these data-transfer types is generally FREE.
- A. Cross-Region data transfer
- B. Cross-AZ data transfer between EC2 instances
- C. Data transfer from EC2 to the internet
- D. Inbound data transfer from the internet into AWS

<details><summary>Answer</summary>

**D.** Inbound data transfer from the internet is generally free. Cross-AZ traffic is charged in each direction, and outbound-to-the-internet and cross-Region transfer both carry data-transfer-out charges. (Traffic within the same AZ over private IP addresses is also free.)
Resource: <https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer>
</details>

**35.** A chatty application tier and its ElastiCache cluster are spread across multiple AZs for high availability, and exchange terabytes of data every month — largely between mismatched AZ pairs, simply by chance of which node each client happened to connect to. How can cost be reduced while keeping HA in mind?
- A. Route clients to cache nodes in their own AZ, keeping other AZs for failover
- B. Send the traffic over public IP addresses instead of private addresses
- C. Route the traffic between tiers through a NAT gateway in each AZ
- D. Move every tier into a single AZ and remove the capacity in the other AZs

<details><summary>Answer</summary>

**A.** Cross-AZ traffic is billed in each direction, so preferring same-AZ cache nodes for normal traffic cuts that cost, while the cache nodes in other AZs remain available for failover if the local one becomes unhealthy.
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/plan-for-data-transfer.html>
</details>

**36.** A company serves static product images directly from an S3 bucket to a global audience, and the data-transfer-out line on the bill keeps climbing as international traffic grows. What lowers both cost and latency?
- A. Turn on Requester Pays for public users
- B. Replicate the bucket to every Region
- C. Put CloudFront in front of the bucket
- D. Enable S3 Transfer Acceleration on the bucket

<details><summary>Answer</summary>

**C.** Data transfer from S3 to CloudFront is free, and CloudFront's data-transfer-out pricing is typically cheaper than S3's directly, while also serving cached content from edge locations closer to users.
Resource: <https://aws.amazon.com/cloudfront/pricing/>
</details>

**37.** A company already has a working Site-to-Site VPN connection and transfers hundreds of TB per month over it between its data center and AWS, and both the cost and occasional throughput variability have become a concern as volume keeps growing. Which option usually lowers data-transfer cost and improves consistency?
- A. AWS Global Accelerator
- B. AWS Direct Connect
- C. A transit gateway in front of the VPN
- D. More VPN tunnels with ECMP

<details><summary>Answer</summary>

**B.** Direct Connect has lower data-transfer-out rates than transferring the same volume over the internet (as a VPN does), plus more consistent, dedicated bandwidth.
Resource: <https://aws.amazon.com/directconnect/pricing/pay-as-you-go/>
</details>

**38.** A company has 20 VPCs, and every single one runs and pays for its own pair of NAT gateways, most of which sit mostly idle outside business hours. How can NAT costs be reduced across the fleet?
- A. Centralize egress in a shared egress VPC reached through Transit Gateway
- B. Peer every VPC with one VPC and share that VPC's NAT gateways
- C. Route the private subnets straight to each VPC's internet gateway
- D. Add a second NAT gateway in each VPC to spread the processing load

<details><summary>Answer</summary>

**A.** Centralizing egress through a shared VPC reached over Transit Gateway consolidates NAT gateways down to a much smaller, shared set. (Weigh the Transit Gateway attachment and data-processing charges against the NAT gateway hours actually saved.)
Resource: <https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/centralized-egress-to-internet.html>
</details>

**39.** During a cost audit, an engineer is surprised to learn that some resources cost money even while sitting completely idle, doing no work at all. Which of these is a real example of that?
- A. Public IPv4 addresses and idle NAT gateways
- B. Security groups with no attached instances
- C. Gateway VPC endpoints with no traffic
- D. Route tables with no associated subnets

<details><summary>Answer</summary>

**A.** AWS charges an hourly rate for all public IPv4 addresses, including unattached Elastic IPs, and NAT gateways are billed hourly whether or not they're processing traffic. The other three are free regardless of use.
Resource: <https://aws.amazon.com/vpc/pricing/>
</details>

**40.** A network architect comparing designs wants to correctly state, in a cost-comparison document, how VPC peering charges differ from Transit Gateway charges. Which statement is CORRECT?
- A. Peering charges per attachment-hour and per GB, the same way as Transit Gateway
- B. Transit Gateway has no charges, while peering charges for each connection-hour
- C. Both are free; only data transfer out to the internet is charged for either
- D. Peering has no hourly charge, only data transfer; Transit Gateway charges per attachment-hour and per GB processed

<details><summary>Answer</summary>

**D.** VPC peering connections themselves have no hourly charge — only the data transferred over them is billed. Transit Gateway, by contrast, charges per attachment-hour plus per GB processed through it.
Resource: <https://aws.amazon.com/transit-gateway/pricing/>
</details>
