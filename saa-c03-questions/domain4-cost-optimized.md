# Domain 4: Design Cost-Optimized Architectures (20%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html>

---

## Task 4.1: Design cost-optimized storage solutions

**1.** Objects are accessed often for 30 days, rarely for the next 60 days, and must be archived for 7 years with retrieval within 12 hours. What is the MOST cost-effective lifecycle?
- A. S3 Standard for 30 days → S3 Glacier Flexible Retrieval for the rest of the 7 years
- B. S3 Standard → S3 Standard-IA after 30 days → S3 Glacier Deep Archive after 90 days
- C. S3 Glacier Instant Retrieval from day 1 → S3 Glacier Deep Archive after 90 days
- D. S3 One Zone-IA from day 1 → S3 Glacier Flexible Retrieval after 90 days

<details><summary>Answer</summary>

**B.** Standard retrieval from Deep Archive completes within 12 hours.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>
</details>

**2.** Access patterns for a data set are unknown and change over time. Which storage class optimizes cost automatically without retrieval fees?
- A. S3 Glacier Flexible Retrieval
- B. S3 One Zone-IA
- C. S3 Standard-IA
- D. S3 Intelligent-Tiering

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html>
</details>

**3.** Secondary backup copies can be recreated easily if lost and are accessed rarely. What is the cheapest option with millisecond access?
- A. S3 Glacier Deep Archive
- B. S3 One Zone-IA
- C. S3 Standard
- D. S3 Standard-IA

<details><summary>Answer</summary>

**B.** It stores data in a single AZ, so it isn't resilient to the loss of that AZ.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**4.** Medical images are rarely accessed (about once a quarter) but must be available in milliseconds when requested. Which class fits?
- A. S3 Glacier Deep Archive
- B. S3 Glacier Flexible Retrieval
- C. S3 Glacier Instant Retrieval
- D. S3 Standard storage class

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html>
</details>

**5.** A bucket with versioning enabled is growing fast because of old versions. How are costs controlled?
- A. A lifecycle rule that expires noncurrent versions after N days
- B. Suspend versioning on the bucket, which removes the old versions
- C. Turn on S3 Object Lock in Governance mode for the bucket
- D. Turn on S3 Intelligent-Tiering for the current versions only

<details><summary>Answer</summary>

**A.** Also add a rule to abort incomplete multipart uploads. Suspending versioning doesn't delete the versions that already exist.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-configuration-examples.html>
</details>

**6.** Which S3 tool gives organization-wide visibility into storage usage and cost-optimization recommendations?
- A. S3 Inventory reports
- B. S3 Storage Lens
- C. Amazon Macie
- D. AWS CloudTrail data events

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage_lens.html>
</details>

**7.** A company has many gp2 volumes. What change usually lowers cost by about 20% while keeping or improving performance?
- A. Migrate them to gp3 with Elastic Volumes
- B. Convert them to st1 Throughput Optimized HDD
- C. Move the data to instance store volumes
- D. Migrate them to io2 with the same IOPS

<details><summary>Answer</summary>

**A.** gp3 is about 20% cheaper per GB than gp2, and Elastic Volumes changes the type without downtime.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/requesting-ebs-volume-modifications.html>
</details>

**8.** A company keeps EBS snapshots for compliance that are rarely restored and must be kept for a year. How can storage costs be cut?
- A. Convert the snapshots to AMIs, which are stored at no charge
- B. Move the snapshots to the EBS Snapshots Archive tier
- C. Move the snapshots to S3 Glacier Deep Archive with a lifecycle rule
- D. Copy the snapshots to a cheaper Region and delete the originals

<details><summary>Answer</summary>

**B.** Archive storage is up to 75% cheaper, with a minimum of 90 days and restores that take 24–72 hours.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-archive.html>
</details>

**9.** An EFS file system holds many files that are rarely accessed after 30 days. What reduces cost?
- A. EFS lifecycle management to the IA or Archive class
- B. Switch the file system to Max I/O performance mode
- C. Switch the file system to Provisioned Throughput mode
- D. Move the data to gp3 EBS volumes attached to each instance

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/efs/latest/ug/lifecycle-management-efs.html>
</details>

**10.** A company wants to replace physical tape backups with a cloud option without changing its backup software. What should it use?
- A. Amazon EFS with the EFS Archive class
- B. AWS Storage Gateway Tape Gateway
- C. AWS Storage Gateway S3 File Gateway
- D. AWS DataSync with a daily scheduled task

<details><summary>Answer</summary>

**B.** Tape Gateway presents a virtual tape library to existing backup software and stores the tapes in S3 and S3 Glacier.
Resource: <https://docs.aws.amazon.com/storagegateway/latest/tgw/WhatIsStorageGateway.html>
</details>

---

## Task 4.2: Design cost-optimized compute solutions

**11.** A fault-tolerant, stateless batch workload can be interrupted and restarted. Which purchasing option is cheapest?
- A. Spot Instances
- B. Dedicated Hosts
- C. On-Demand Instances
- D. 3-year Reserved Instances

<details><summary>Answer</summary>

**A.** Spot Instances cost up to 90% less than On-Demand and get a 2-minute interruption notice.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html>
</details>

**12.** A company runs steady 24/7 workloads on EC2, Fargate, and Lambda and wants a flexible commitment discount that applies across instance families and Regions. What should it buy?
- A. Spot Instances
- B. EC2 Instance Savings Plans
- C. Compute Savings Plans
- D. Standard Reserved Instances

<details><summary>Answer</summary>

**C.** EC2 Instance Savings Plans give a higher discount but are locked to one instance family in one Region.
Resource: <https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html>
</details>

**13.** A company must reserve EC2 capacity in a specific AZ for a two-week event, without a long-term commitment. What should it use?
- A. On-Demand Capacity Reservations
- B. Standard Reserved Instances (3-year)
- C. Compute Savings Plans (1-year)
- D. Spot Instances with a maximum price

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
- A. All Spot Instances of a single instance type, sized for the peak
- B. All On-Demand Instances, sized for the peak and running around the clock
- C. Dedicated Hosts for the baseline and On-Demand Instances for the peaks
- D. Mixed instances: Savings Plans-covered On-Demand baseline, Spot for peaks

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-mixed-instances-groups.html>
</details>

**16.** Which change can improve price-performance by up to 40% for many Linux workloads with little effort?
- A. Move to instances with NVMe instance store volumes
- B. Move to AWS Graviton (Arm-based) instances
- C. Move to larger x86 instances and consolidate workloads
- D. Move to Dedicated Hosts with the same instance type

<details><summary>Answer</summary>

**B.**
Resource: <https://aws.amazon.com/ec2/graviton/>
</details>

**17.** Development and test EC2 instances run 24/7 but are used only during business hours. What is an easy cost reduction?
- A. Resize them to a larger type so that work finishes sooner
- B. Move them to Dedicated Hosts to reduce the licensing cost
- C. Buy 3-year Reserved Instances that cover all of the instances
- D. Stop them outside business hours with Instance Scheduler on AWS

<details><summary>Answer</summary>

**D.** Scheduled Auto Scaling actions work too, for instances in an Auto Scaling group.
Resource: <https://docs.aws.amazon.com/solutions/latest/instance-scheduler-on-aws/solution-overview.html>
</details>

**18.** A lightly used internal API runs on two always-on EC2 instances and gets a few thousand requests a day. What is likely the MOST cost-effective re-architecture?
- A. An EC2 Auto Scaling group with a minimum of four instances
- B. Amazon ECS on EC2 with four tasks across two instances
- C. Amazon API Gateway with AWS Lambda functions
- D. Larger EC2 instances behind an Application Load Balancer

<details><summary>Answer</summary>

**C.** With a few thousand requests a day, paying per request costs far less than two always-on instances.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/welcome.html>
</details>

**19.** Which tool identifies idle and underused resources, such as low-utilization EC2 instances and unassociated Elastic IPs, as cost checks?
- A. AWS Artifact reports
- B. AWS X-Ray
- C. AWS Trusted Advisor
- D. Amazon Inspector

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html>
</details>

**20.** A company wants alerts when forecast monthly spend will exceed $10,000. What should it use?
- A. An AWS CloudTrail trail with Insights events
- B. AWS Cost Explorer with a saved report
- C. An AWS Config rule that checks instance types
- D. AWS Budgets with a forecast-based alert

<details><summary>Answer</summary>

**D.** AWS Cost Anomaly Detection catches unusual spikes that fixed thresholds miss.
Resource: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>
</details>

**21.** Finance needs to allocate AWS costs to departments. What must be done?
- A. Enable VPC Flow Logs and add up the traffic by department
- B. Apply and activate cost allocation tags, or use separate accounts
- C. Put each department's users in its own IAM group
- D. Deploy each department's resources in a separate Region

<details><summary>Answer</summary>

**B.** Separate accounts under consolidated billing also split costs cleanly.
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html>
</details>

**22.** Which AWS Organizations feature lets accounts combine usage to reach volume pricing tiers and share RI and Savings Plans discounts?
- A. Tag policies
- B. Service control policies
- C. Consolidated billing
- D. Delegated administrator

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html>
</details>

---

## Task 4.3: Design cost-optimized database solutions

**23.** A DynamoDB table has predictable, steady traffic. Which capacity mode is usually cheaper?
- A. Provisioned capacity with auto scaling
- B. Global tables with on-demand capacity
- C. On-demand capacity
- D. Provisioned capacity fixed at twice the average load

<details><summary>Answer</summary>

**A.** Reserved capacity lowers the cost further. On-demand is best for unknown or spiky traffic.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html>
</details>

**24.** A DynamoDB table holds large amounts of rarely read historical items. Which option lowers storage cost?
- A. DynamoDB Accelerator (DAX) in front of the table
- B. The DynamoDB Standard-Infrequent Access table class
- C. Global tables with a replica in a lower-cost Region
- D. More read capacity units provisioned on the table

<details><summary>Answer</summary>

**B.** For data that's rarely needed at all, TTL plus export to S3 is another option.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.TableClasses.html>
</details>

**25.** Session records in DynamoDB should be deleted automatically after 24 hours, at no cost for the deletes. What should be used?
- A. A Lambda cron job that deletes items
- B. DynamoDB Streams
- C. Time to Live (TTL)
- D. Point-in-time recovery

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html>
</details>

**26.** A production RDS database runs 24/7 at a stable size for the next three years. How should cost be minimized?
- A. Run the database on Spot Instances through Amazon RDS
- B. Move it to RDS Custom so that Spot pricing applies
- C. Keep it On-Demand and scale the instance down at night
- D. Buy RDS Reserved Instances or a Database Savings Plan

<details><summary>Answer</summary>

**D.** Spot isn't available for RDS in any form.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithReservedDBInstances.html>
</details>

**27.** A development RDS database is used only 8 hours a day. What is a simple cost saving?
- A. Stop the instance when it isn't in use
- B. Increase allocated storage to raise baseline IOPS
- C. Enable Multi-AZ to spread the cost across AZs
- D. Add read replicas and shrink the primary instance

<details><summary>Answer</summary>

**A.** A stopped instance restarts automatically after 7 days. Alternatively, use Aurora Serverless v2, which can scale down to 0 ACUs.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html>
</details>

**28.** A company is migrating from Oracle on premises to reduce licensing costs, and it's willing to change engines. Which tools help?
- A. AWS Snowball Edge to ship the Oracle database files to Amazon S3
- B. AWS SCT (or DMS Schema Conversion) with AWS DMS, targeting Aurora PostgreSQL
- C. AWS Application Migration Service to rehost the Oracle servers on EC2
- D. AWS DataSync to copy the Oracle data files into Amazon RDS for Oracle

<details><summary>Answer</summary>

**B.** This is a heterogeneous migration.
Resource: <https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html>
</details>

**29.** Read-heavy traffic forces the team to keep scaling up an expensive RDS instance. What is often cheaper?
- A. Move to a larger instance class with more memory
- B. Cache hot data in ElastiCache, or add read replicas
- C. Enable Multi-AZ so that the standby serves the reads
- D. Switch the storage to Provisioned IOPS (io2) volumes

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html>
</details>

**30.** Which RDS storage feature scales storage up automatically when free space runs low, so you don't over-provision?
- A. RDS Proxy connection pooling
- B. RDS storage autoscaling
- C. Performance Insights
- D. Aurora Backtrack

<details><summary>Answer</summary>

**B.** Aurora storage grows automatically.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIOPS.Autoscaling.html>
</details>

**31.** An I/O-heavy Aurora workload has I/O charges above 25% of its Aurora bill. Which configuration can lower total cost?
- A. Aurora Standard
- B. Aurora Backtrack
- C. Aurora I/O-Optimized
- D. RDS for MySQL with gp3 storage

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html#aurora-storage-type>
</details>

**32.** Infrequent analytics over years of S3 log data are run on an always-on Redshift cluster. What is cheaper?
- A. Query the data in place in S3 with Amazon Athena
- B. Import the logs into DynamoDB and run a scan for each analysis
- C. Resize the cluster to larger RA3 nodes so that queries finish sooner
- D. Load the logs into Amazon RDS for PostgreSQL and query them there

<details><summary>Answer</summary>

**A.** Redshift Spectrum or Redshift Serverless also avoid paying for an always-on cluster.
Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-serverless.html>
</details>

---

## Task 4.4: Design cost-optimized network architectures

**33.** Private instances send large volumes of data to S3 through a NAT gateway, and NAT data processing charges are high. What is the MOST cost-effective fix?
- A. Add an S3 gateway VPC endpoint
- B. Use Transfer Acceleration
- C. Add a second NAT gateway
- D. Use an internet gateway for private subnets

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html>
</details>

**34.** Which data transfer is generally FREE?
- A. Cross-Region data transfer
- B. Cross-AZ data transfer between EC2 instances
- C. Data transfer from EC2 to the internet
- D. Inbound data transfer from the internet into AWS

<details><summary>Answer</summary>

**D.** Cross-AZ traffic is charged in each direction. Traffic within the same AZ over private IP addresses is free.
Resource: <https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer>
</details>

**35.** A chatty application tier and its cache sit in different AZs and exchange TBs of data each month. How can cost be reduced while keeping HA in mind?
- A. Route clients to cache nodes in their own AZ, keeping other AZs for failover
- B. Send the traffic over public IP addresses instead of private addresses
- C. Route the traffic between tiers through a NAT gateway in each AZ
- D. Move every tier into a single AZ and remove the capacity in the other AZs

<details><summary>Answer</summary>

**A.** Cross-AZ traffic is charged in each direction, so AZ-aware routing cuts the bill while the other AZs still provide failover.
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/plan-for-data-transfer.html>
</details>

**36.** Serving static assets from S3 directly to global users costs a lot in data transfer out. What lowers cost and latency?
- A. Turn on Requester Pays for public users
- B. Replicate the bucket to every Region
- C. Put CloudFront in front of the bucket
- D. Enable S3 Transfer Acceleration on the bucket

<details><summary>Answer</summary>

**C.** Transfer from S3 to CloudFront is free, and CloudFront's data transfer out is typically cheaper than S3's.
Resource: <https://aws.amazon.com/cloudfront/pricing/>
</details>

**37.** A company transfers hundreds of TB per month between its data center and AWS over VPN. Which option usually lowers data transfer cost and improves consistency?
- A. AWS Global Accelerator
- B. AWS Direct Connect
- C. A transit gateway in front of the VPN
- D. More VPN tunnels with ECMP

<details><summary>Answer</summary>

**B.** Direct Connect has lower data-transfer-out rates than the internet and more consistent performance.
Resource: <https://aws.amazon.com/directconnect/pricing/pay-as-you-go/>
</details>

**38.** A company has 20 VPCs, and every one has its own NAT gateways. How can NAT costs be reduced?
- A. Centralize egress in a shared egress VPC reached through Transit Gateway
- B. Peer every VPC with one VPC and share that VPC's NAT gateways
- C. Route the private subnets straight to each VPC's internet gateway
- D. Add a second NAT gateway in each VPC to spread the processing load

<details><summary>Answer</summary>

**A.** Weigh the Transit Gateway attachment and processing charges against the NAT gateway hours saved.
Resource: <https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/centralized-egress-to-internet.html>
</details>

**39.** Which item can incur charges even when it isn't doing any work?
- A. Public IPv4 addresses and idle NAT gateways
- B. Security groups with no attached instances
- C. Gateway VPC endpoints with no traffic
- D. Route tables with no associated subnets

<details><summary>Answer</summary>

**A.** AWS charges for all public IPv4 addresses, including unattached Elastic IPs.
Resource: <https://aws.amazon.com/vpc/pricing/>
</details>

**40.** Which statement about VPC peering versus Transit Gateway costs is CORRECT?
- A. Peering charges per attachment-hour and per GB, the same way as Transit Gateway
- B. Transit Gateway has no charges, while peering charges for each connection-hour
- C. Both are free; only data transfer out to the internet is charged for either
- D. Peering has no hourly charge, only data transfer; TGW charges per attachment-hour and per GB

<details><summary>Answer</summary>

**D.**
Resource: <https://aws.amazon.com/transit-gateway/pricing/>
</details>
