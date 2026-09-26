# Domain 2: Design Resilient Architectures (26%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain2.html>

---

## Task 2.1: Design scalable and loosely coupled architectures

**1.** An order-processing web tier sometimes gets traffic spikes that overwhelm the backend workers, and orders are lost. What design change decouples the tiers and prevents lost orders?
- A. Add more EC2 instances to the web tier
- B. Put orders in an Amazon SQS queue and scale the worker Auto Scaling group on queue depth
- C. Use a larger RDS instance
- D. Use Route 53 weighted routing

<details><summary>Answer</summary>

**B.** SQS buffers messages so that workers process them at their own pace. Scale the workers on `ApproximateNumberOfMessagesVisible` (backlog per instance).
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>
</details>

**2.** Messages must be processed exactly once and in the order they're sent for each customer. Which queue type should be used?
- A. SQS standard queue
- B. SQS FIFO queue with the customer ID as the message group ID
- C. SNS standard topic
- D. Amazon Data Firehose

<details><summary>Answer</summary>

**B.** FIFO queues keep order within a message group and deduplicate messages.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html>
</details>

**3.** A single event must be delivered to three independent systems (billing, shipping, and analytics), and each must process it at its own pace. What is the BEST pattern?
- A. One SQS queue polled by all three
- B. An SNS topic that fans out to three SQS queues
- C. Three Lambda functions called in sequence
- D. A shared EFS file

<details><summary>Answer</summary>

**B.** SNS-to-SQS fan-out.
Resource: <https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html>
</details>

**4.** A message fails processing over and over and blocks other work. What should be configured?
- A. A dead-letter queue (DLQ) with a `maxReceiveCount` redrive policy
- B. A longer retention period
- C. Short polling
- D. A larger message size

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html>
</details>

**5.** Consumers sometimes process the same SQS message twice because processing takes longer than expected. What should be adjusted?
- A. Increase the visibility timeout to exceed the processing time
- B. Decrease the retention period
- C. Enable long polling
- D. Increase the delay queue setting

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html>
</details>

**6.** A company wants to cut the number of empty ReceiveMessage responses, and the cost that comes with them, when polling SQS. What should be enabled?
- A. Long polling (`WaitTimeSeconds` up to 20)
- B. FIFO
- C. A DLQ
- D. Message timers

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html>
</details>

**7.** A workflow has several steps with retries, branching, human approval, and wait states of up to several months. Which service orchestrates it?
- A. AWS Step Functions (Standard workflows)
- B. Amazon SQS
- C. A single Lambda function
- D. Amazon EventBridge Scheduler

<details><summary>Answer</summary>

**A.** Standard workflows can run for up to one year. Express workflows are for high-volume executions that last up to 5 minutes.
Resource: <https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html>
</details>

**8.** SaaS partner events (for example, from Zendesk) and AWS service events must be routed to different targets based on content rules. Which service should be used?
- A. Amazon EventBridge
- B. Amazon SNS
- C. Amazon MQ
- D. AWS AppSync

<details><summary>Answer</summary>

**A.** EventBridge supports partner event sources, content-based filtering rules, and schema discovery.
Resource: <https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html>
</details>

**9.** A company is migrating an on-premises application that uses Apache ActiveMQ over the AMQP and MQTT protocols, and it wants to avoid code changes. Which service should it use?
- A. Amazon SQS
- B. Amazon MQ
- C. Amazon SNS
- D. Amazon Kinesis

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html>
</details>

**10.** A stateless web application runs on EC2 behind an ALB. Session data is lost when instances scale in. What is the BEST fix for scalability?
- A. Enable sticky sessions permanently
- B. Store session state externally in ElastiCache or DynamoDB
- C. Use larger instances
- D. Disable scale-in

<details><summary>Answer</summary>

**B.** Keeping state out of the instances lets any of them serve any request.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/elasticache-use-cases.html>
</details>

**11.** An API has unpredictable traffic that ranges from zero to thousands of requests per second. The team wants no servers to manage. What is the BEST architecture?
- A. Amazon API Gateway + AWS Lambda + Amazon DynamoDB (on-demand)
- B. EC2 + RDS
- C. ECS on EC2 with fixed capacity
- D. Elastic Beanstalk with a single instance

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html>
</details>

**12.** A company wants to run containers without managing servers or clusters of EC2 instances. What should it use?
- A. Amazon ECS or Amazon EKS with AWS Fargate
- B. ECS on EC2
- C. AWS Batch on Spot
- D. Amazon Lightsail

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>
</details>

**13.** An API backend must be protected from sudden bursts of requests from a single client. Which API Gateway feature helps?
- A. Usage plans with throttling and API keys
- B. Caching only
- C. Canary deployments
- D. Mapping templates

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html>
</details>

**14.** An image-upload service must generate thumbnails as soon as images land in S3. What is the most loosely coupled approach?
- A. S3 event notifications (or EventBridge) that invoke a Lambda function
- B. A cron job on EC2 that lists the bucket every minute
- C. Polling from the web tier
- D. S3 Replication

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html>
</details>

**15.** Several Lambda functions in a serverless application open too many connections to an RDS MySQL database during spikes. What fixes this?
- A. Amazon RDS Proxy
- B. A larger RDS instance
- C. Multi-AZ
- D. Read replicas

<details><summary>Answer</summary>

**A.** RDS Proxy pools and shares connections, and it also speeds up failover.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html>
</details>

**16.** A company wants to cache frequently read, rarely changed database query results to take load off the database and lower latency. Which service should be used?
- A. Amazon ElastiCache (Redis OSS or Memcached)
- B. Amazon S3
- C. Amazon EFS
- D. AWS Global Accelerator

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html>
</details>

**17. (Select TWO.)** Which are characteristics of a loosely coupled architecture?
- A. Components communicate through queues or events
- B. A failure in one component cascades to all others
- C. Components can scale independently
- D. Components share a local disk
- E. Hard-coded IP addresses between tiers

<details><summary>Answer</summary>

**A, C.**
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html>
</details>

**18.** A company wants microservices in different VPCs and accounts to talk to each other over HTTP, with service discovery and IAM authorization, and without managing load balancers or peering. What fits BEST?
- A. Amazon VPC Lattice
- B. VPC peering mesh
- C. A NAT gateway
- D. Direct Connect

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html>
</details>

**19.** Which EC2 Auto Scaling policy keeps average CPU at 50% with the least configuration?
- A. Target tracking scaling
- B. Simple scaling
- C. Step scaling
- D. Scheduled scaling

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
</details>

**20.** Traffic rises at 8 AM every weekday, but new instances take 10 minutes to become ready. What avoids slow responses at the start of the day?
- A. Scheduled scaling (or predictive scaling) combined with warm pools
- B. Simple scaling on CPU
- C. Manual scaling
- D. Increase the cooldown

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html>
</details>

---

## Task 2.2: Design highly available and/or fault-tolerant architectures

**21.** A production RDS MySQL database must survive the failure of an Availability Zone with automatic failover. What should be enabled?
- A. Multi-AZ deployment
- B. A read replica in the same AZ
- C. Automated backups only
- D. A larger instance class

<details><summary>Answer</summary>

**A.** Multi-AZ keeps a synchronous standby. Failover typically completes in 60–120 seconds, and the DNS endpoint stays the same.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
</details>

**22.** What is the main purpose of an RDS read replica compared with Multi-AZ?
- A. Read replicas scale reads (asynchronous replication); Multi-AZ provides high availability (synchronous)
- B. Both are synchronous
- C. Read replicas give automatic failover by default
- D. Multi-AZ standbys serve read traffic in all engines

<details><summary>Answer</summary>

**A.** Note that a Multi-AZ DB cluster deployment (two readable standbys) can serve reads.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
</details>

**23.** A web application must keep running if an entire AZ fails. What is the minimum correct design?
- A. An Auto Scaling group across at least two AZs behind an ALB
- B. One large EC2 instance
- C. Two instances in the same AZ
- D. A single instance with an Elastic IP

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-availability-zone-balanced.html>
</details>

**24.** A company needs an RTO of hours and an RPO of hours for a secondary Region at the lowest cost. Which DR strategy fits?
- A. Backup and restore
- B. Pilot light
- C. Warm standby
- D. Multi-site active/active

<details><summary>Answer</summary>

**A.** Ordered by cost and RTO/RPO: backup and restore (hours), then pilot light (tens of minutes), then warm standby (minutes), then active/active (near zero).
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**25.** In a DR plan, core databases are kept replicated in the DR Region while application servers are switched off and only started (from AMIs) during a disaster. Which strategy is this?
- A. Pilot light
- B. Warm standby
- C. Backup and restore
- D. Active/active

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**26.** A global application needs a relational database with typically sub-second cross-Region replication and the ability to promote a secondary Region within minutes. What fits?
- A. Amazon Aurora Global Database
- B. RDS Multi-AZ
- C. DynamoDB Accelerator
- D. RDS cross-Region snapshots

<details><summary>Answer</summary>

**A.** Replication lag is typically under a second, and a secondary cluster usually takes over the primary role within a few minutes.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html>
</details>

**27.** A NoSQL workload needs multi-Region, multi-active writes with low latency for users on several continents. Which option fits?
- A. DynamoDB global tables
- B. DynamoDB with a single-Region table plus DAX
- C. ElastiCache
- D. RDS read replicas

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html>
</details>

**28.** Users should be sent to a secondary Region automatically when the primary Region's endpoint fails its health check. Which Route 53 routing policy should be used?
- A. Failover routing with health checks
- B. Simple routing
- C. Weighted routing with equal weights and no health checks
- D. Geolocation routing only

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html>
</details>

**29.** Which Route 53 routing policy sends users to the Region with the lowest network latency?
- A. Latency-based routing
- B. Geolocation
- C. Multivalue answer
- D. Weighted

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html>
</details>

**30.** A company needs static anycast IP addresses and fast (under a minute) failover between Regions for a TCP/UDP gaming application. What should it use?
- A. AWS Global Accelerator
- B. Amazon CloudFront
- C. Route 53 simple routing
- D. An NLB in one Region

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html>
</details>

**31.** A shared file system must be mounted by Linux EC2 instances in multiple AZs and must survive the loss of an AZ. What should be used?
- A. Amazon EFS (Regional)
- B. An EBS volume with Multi-Attach
- C. Instance store
- D. EFS One Zone

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html>
</details>

**32.** Instances in an Auto Scaling group are marked healthy by EC2 status checks even when the application returns HTTP 500 errors. What fixes this?
- A. Turn on ELB health checks for the Auto Scaling group
- B. Increase the instance size
- C. Disable health checks
- D. Use scheduled scaling

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html>
</details>

**33.** A company must replicate S3 objects to another Region for compliance and DR. What is required?
- A. S3 Cross-Region Replication, with versioning enabled on both buckets
- B. S3 Transfer Acceleration
- C. Lifecycle rules
- D. CloudFront

<details><summary>Answer</summary>

**A.** S3 Replication Time Control (RTC) adds an SLA to replicate 99.99% of objects within 15 minutes.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html>
</details>

**34.** A company wants to replicate on-premises servers to AWS continuously at the block level, for DR with an RPO of seconds and an RTO of minutes. Which service should it use?
- A. AWS Elastic Disaster Recovery (AWS DRS)
- B. AWS Backup
- C. AWS DataSync
- D. AWS Snowball

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html>
</details>

**35.** An application uses a single NAT gateway in one AZ. What happens if that AZ fails, and how is this fixed?
- A. Instances in other AZs lose outbound internet access; deploy one NAT gateway per AZ and route each AZ to its own
- B. Nothing happens; a NAT gateway created in one AZ fails over to other AZs automatically
- C. Traffic moves automatically to the internet gateway
- D. Use a NAT instance instead

<details><summary>Answer</summary>

**A.** A standard (zonal) NAT gateway lives in one AZ. Alternatively, a regional NAT gateway expands across AZs automatically.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>
</details>

**36.** An on-premises data center connects to AWS through a single Direct Connect link. How can this be made highly available at the lowest cost?
- A. Add a backup Site-to-Site VPN connection
- B. Add another Direct Connect link at the same location
- C. Use VPC peering
- D. Use an internet gateway

<details><summary>Answer</summary>

**A.** The highest resiliency comes from multiple DX connections at separate locations. A VPN backup is the low-cost option.
Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html>
</details>

**37.** Which Aurora feature keeps six copies of data across three AZs and repairs itself automatically?
- A. The Aurora cluster storage volume
- B. Aurora Backtrack
- C. Aurora Serverless
- D. Aurora Auto Scaling

<details><summary>Answer</summary>

**A.** The storage survives the loss of 2 copies for writes and 3 copies for reads. Up to 15 Aurora Replicas can be promoted during failover.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html>
</details>

**38.** A company wants to test how its workload behaves when AZs fail or instances are terminated, in a controlled way. Which service should it use?
- A. AWS Fault Injection Service (FIS)
- B. AWS Trusted Advisor
- C. Amazon Inspector
- D. AWS X-Ray

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/fis/latest/userguide/what-is.html>
</details>

**39.** A DynamoDB table must be recoverable to any second in the last 35 days. What should be enabled?
- A. Point-in-time recovery (PITR)
- B. DynamoDB Streams
- C. TTL
- D. DAX

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html>
</details>

**40.** Operations wants end-to-end tracing to find which microservice causes latency spikes and errors. Which service helps?
- A. AWS X-Ray
- B. AWS CloudTrail
- C. VPC Flow Logs
- D. AWS Config

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html>
</details>
