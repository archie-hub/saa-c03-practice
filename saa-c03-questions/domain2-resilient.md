# Domain 2: Design Resilient Architectures (26%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain2.html>

---

## Task 2.1: Design scalable and loosely coupled architectures

**1.** An order-processing web tier sometimes gets traffic spikes that overwhelm the backend workers, and orders are lost. What design change decouples the tiers and prevents lost orders?
- A. Add more EC2 instances to the web tier and turn on cross-zone load balancing
- B. Use Route 53 weighted routing to spread requests across two web tiers
- C. Send orders to an Amazon SQS queue and scale the workers on queue depth
- D. Move the backend database to a larger RDS instance class with Provisioned IOPS

<details><summary>Answer</summary>

**C.** SQS buffers messages so that workers process them at their own pace. Scale the workers on `ApproximateNumberOfMessagesVisible` (backlog per instance).
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>
</details>

**2.** Messages must be processed exactly once and in the order they're sent for each customer. Which queue type should be used?
- A. Amazon Data Firehose stream partitioned by the customer ID
- B. SQS FIFO queue with the customer ID as the message group ID
- C. SQS standard queue with the customer ID as a message attribute
- D. SNS standard topic with a subscription filter on the customer ID

<details><summary>Answer</summary>

**B.** FIFO queues keep order within a message group and deduplicate messages.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html>
</details>

**3.** A single event must be delivered to three independent systems (billing, shipping, and analytics), and each must process it at its own pace. What is the BEST pattern?
- A. Three Lambda functions called in sequence
- B. One SQS queue polled by all three systems
- C. A shared EFS file that each system reads on a schedule
- D. An SNS topic that fans out to three SQS queues

<details><summary>Answer</summary>

**D.** SNS-to-SQS fan-out.
Resource: <https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html>
</details>

**4.** A message fails processing over and over and blocks other work. What should be configured?
- A. Short polling with a smaller `ReceiveMessage` batch size
- B. A longer message retention period on the source queue
- C. A dead-letter queue (DLQ) with a `maxReceiveCount` redrive policy
- D. A delivery delay that postpones new messages by 15 minutes

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html>
</details>

**5.** Consumers sometimes process the same SQS message twice because processing takes longer than expected. What should be adjusted?
- A. Decrease the retention period so that messages expire sooner
- B. Increase the visibility timeout so that it exceeds the processing time
- C. Increase the delivery delay so that messages arrive later
- D. Enable long polling by setting `WaitTimeSeconds` to 20

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html>
</details>

**6.** A company wants to cut the number of empty ReceiveMessage responses, and the cost that comes with them, when polling SQS. What should be enabled?
- A. A dead-letter queue with a low `maxReceiveCount`
- B. Message timers that delay each message by 15 minutes
- C. Long polling, with `WaitTimeSeconds` of up to 20 seconds
- D. A FIFO queue with content-based deduplication

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html>
</details>

**7.** A workflow has several steps with retries, branching, human approval, and wait states of up to several months. Which service orchestrates it?
- A. EventBridge Scheduler with one schedule per step
- B. An SQS queue with a Lambda consumer for each step
- C. AWS Step Functions Express workflows
- D. AWS Step Functions Standard workflows

<details><summary>Answer</summary>

**D.** Standard workflows can run for up to one year. Express workflows (wrong here) are for high-volume executions that last up to 5 minutes.
Resource: <https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html>
</details>

**8.** SaaS partner events (for example, from Zendesk) and AWS service events must be routed to different targets based on content rules. Which service should be used?
- A. Amazon EventBridge
- B. Amazon MQ with a broker for each partner
- C. Amazon SNS with subscription filter policies
- D. AWS AppSync with a subscription for each target

<details><summary>Answer</summary>

**A.** EventBridge supports partner event sources, content-based filtering rules, and schema discovery.
Resource: <https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html>
</details>

**9.** A company is migrating an on-premises application that uses Apache ActiveMQ over the AMQP and MQTT protocols, and it wants to avoid code changes. Which service should it use?
- A. Amazon SNS
- B. Amazon Kinesis
- C. Amazon MQ
- D. Amazon SQS

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html>
</details>

**10.** A stateless web application runs on EC2 behind an ALB. Session data is lost when instances scale in. What is the BEST fix for scalability?
- A. Turn on sticky sessions on the ALB with a long cookie duration
- B. Store session state externally in ElastiCache or DynamoDB
- C. Turn off scale-in on the Auto Scaling group during business hours
- D. Use larger instances so that fewer of them are needed at peak

<details><summary>Answer</summary>

**B.** Keeping state out of the instances lets any of them serve any request.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/elasticache-use-cases.html>
</details>

**11.** An API has unpredictable traffic that ranges from zero to thousands of requests per second. The team wants no servers to manage. What is the BEST architecture?
- A. AWS Elastic Beanstalk with a single-instance environment
- B. Amazon API Gateway, AWS Lambda, and DynamoDB in on-demand mode
- C. EC2 instances in an Auto Scaling group with an Amazon RDS database
- D. Amazon ECS on EC2 with a fixed number of container instances

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html>
</details>

**12.** A company wants to run containers without managing servers or clusters of EC2 instances. What should it use?
- A. Amazon ECS or Amazon EKS with AWS Fargate
- B. AWS Batch with a managed EC2 Spot compute environment
- C. Amazon ECS with an EC2 Auto Scaling group capacity provider
- D. Amazon Lightsail instances with Docker installed

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>
</details>

**13.** An API backend must be protected from sudden bursts of requests from a single client. Which API Gateway feature helps?
- A. Usage plans with throttling limits and API keys
- B. Canary release deployments on the production stage
- C. Mapping templates that validate the request body
- D. Stage-level response caching with a long TTL

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html>
</details>

**14.** An image-upload service must generate thumbnails as soon as images land in S3. What is the most loosely coupled approach?
- A. A cron job on an EC2 instance that lists the bucket every minute
- B. S3 event notifications (or EventBridge) that invoke a Lambda function
- C. S3 Replication to a second bucket that is configured for thumbnails
- D. The web tier polls the bucket after each upload and resizes the image

<details><summary>Answer</summary>

**B.**
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
- A. Amazon EFS with Elastic Throughput
- B. AWS Global Accelerator in front of the database
- C. Amazon ElastiCache (Redis OSS or Memcached)
- D. Amazon S3 with S3 Intelligent-Tiering

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html>
</details>

**17. (Select TWO.)** Which are characteristics of a loosely coupled architecture?
- A. A failure in one component cascades to all others
- B. Components share a local disk
- C. Components can scale independently
- D. Hard-coded IP addresses between tiers
- E. Components communicate through queues or events

<details><summary>Answer</summary>

**C, E.**
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html>
</details>

**18.** A company wants microservices in different VPCs and accounts to talk to each other over HTTP, with service discovery and IAM authorization, and without managing load balancers or peering. What fits BEST?
- A. Amazon VPC Lattice
- B. Direct Connect
- C. VPC peering mesh
- D. A NAT gateway

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html>
</details>

**19.** Which EC2 Auto Scaling policy keeps average CPU at 50% with the least configuration?
- A. Step scaling with several CloudWatch alarms
- B. Scheduled scaling actions every hour
- C. Target tracking scaling
- D. Simple scaling with a CloudWatch alarm

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
</details>

**20.** Traffic rises at 8 AM every weekday, but new instances take 10 minutes to become ready. What avoids slow responses at the start of the day?
- A. Target tracking on request count per target with a low target
- B. Scheduled (or predictive) scaling combined with a warm pool
- C. Simple scaling on CPU utilization with a lower alarm threshold
- D. A longer default cooldown so that new instances aren't terminated

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html>
</details>

---

## Task 2.2: Design highly available and/or fault-tolerant architectures

**21.** A production RDS MySQL database must survive the failure of an Availability Zone with automatic failover. What should be enabled?
- A. A read replica in the same AZ
- B. Multi-AZ deployment
- C. A larger instance class
- D. Automated backups only

<details><summary>Answer</summary>

**B.** Multi-AZ keeps a synchronous standby. Failover typically completes in 60–120 seconds, and the DNS endpoint stays the same.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
</details>

**22.** What is the main purpose of an RDS read replica compared with Multi-AZ?
- A. Read replicas scale reads with asynchronous replication; Multi-AZ provides high availability
- B. Multi-AZ standbys serve reads in every engine; read replicas exist only for backups
- C. Read replicas provide automatic failover by default; Multi-AZ is for scaling reads
- D. Both use synchronous replication, but only read replicas can be in another Region

<details><summary>Answer</summary>

**A.** Note that a Multi-AZ DB cluster deployment (two readable standbys) can serve reads.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
</details>

**23.** A web application must keep running if an entire AZ fails. What is the minimum correct design?
- A. A single instance with CloudWatch alarm-based automatic recovery
- B. An Auto Scaling group across at least two AZs behind an ALB
- C. Two instances in the same AZ behind an Application Load Balancer
- D. One large EC2 instance with an Elastic IP address attached

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-availability-zone-balanced.html>
</details>

**24.** A company needs an RTO of hours and an RPO of hours for a secondary Region at the lowest cost. Which DR strategy fits?
- A. Multi-site active/active
- B. Pilot light
- C. Backup and restore
- D. Warm standby

<details><summary>Answer</summary>

**C.** Ordered by cost and RTO/RPO: backup and restore (hours), then pilot light (tens of minutes), then warm standby (minutes), then active/active (near zero).
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**25.** In a DR plan, core databases are kept replicated in the DR Region while application servers are switched off and only started (from AMIs) during a disaster. Which strategy is this?
- A. Active/active
- B. Warm standby
- C. Pilot light
- D. Backup and restore

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**26.** A global application needs a relational database with typically sub-second cross-Region replication and the ability to promote a secondary Region within minutes. What fits?
- A. RDS Multi-AZ DB cluster
- B. RDS cross-Region snapshot copies
- C. DynamoDB global tables
- D. Amazon Aurora Global Database

<details><summary>Answer</summary>

**D.** Replication lag is typically under a second, and a secondary cluster usually takes over the primary role within a few minutes.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html>
</details>

**27.** A NoSQL workload needs multi-Region, multi-active writes with low latency for users on several continents. Which option fits?
- A. RDS read replicas
- B. ElastiCache
- C. DynamoDB with a single-Region table plus DAX
- D. DynamoDB global tables

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html>
</details>

**28.** Users should be sent to a secondary Region automatically when the primary Region's endpoint fails its health check. Which Route 53 routing policy should be used?
- A. Geolocation routing only
- B. Weighted routing with equal weights and no health checks
- C. Failover routing with health checks
- D. Simple routing with multiple IP addresses

<details><summary>Answer</summary>

**C.**
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html>
</details>

**29.** Which Route 53 routing policy sends users to the Region with the lowest network latency?
- A. Weighted routing
- B. Latency-based routing
- C. Geolocation routing
- D. Multivalue answer routing

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html>
</details>

**30.** A company needs static anycast IP addresses and fast (under a minute) failover between Regions for a TCP/UDP gaming application. What should it use?
- A. Amazon CloudFront
- B. Route 53 simple routing
- C. An NLB in one Region
- D. AWS Global Accelerator

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html>
</details>

**31.** A shared file system must be mounted by Linux EC2 instances in multiple AZs and must survive the loss of an AZ. What should be used?
- A. An EBS volume with Multi-Attach
- B. Amazon EFS (Regional)
- C. Instance store
- D. EFS One Zone

<details><summary>Answer</summary>

**B.**
Resource: <https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html>
</details>

**32.** Instances in an Auto Scaling group are marked healthy by EC2 status checks even when the application returns HTTP 500 errors. What fixes this?
- A. Move to a larger instance type to reduce the errors
- B. Add a scheduled action that replaces instances nightly
- C. Turn off health checks so instances aren't replaced
- D. Turn on ELB health checks for the Auto Scaling group

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html>
</details>

**33.** A company must replicate S3 objects to another Region for compliance and DR. What is required?
- A. S3 Cross-Region Replication, with versioning enabled on both buckets
- B. S3 Transfer Acceleration, enabled on the source bucket
- C. A CloudFront distribution that uses the bucket as its origin
- D. A lifecycle rule that transitions objects to the other Region

<details><summary>Answer</summary>

**A.** S3 Replication Time Control (RTC) adds an SLA to replicate 99.99% of objects within 15 minutes.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html>
</details>

**34.** A company wants to replicate on-premises servers to AWS continuously at the block level, for DR with an RPO of seconds and an RTO of minutes. Which service should it use?
- A. AWS Elastic Disaster Recovery (AWS DRS)
- B. AWS Application Migration Service (MGN)
- C. AWS DataSync tasks scheduled every hour
- D. AWS Backup with an hourly backup plan

<details><summary>Answer</summary>

**A.** AWS DRS keeps servers replicated for recovery and failback. Application Migration Service uses similar replication but is built for one-time migrations, not ongoing DR.
Resource: <https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html>
</details>

**35.** An application uses a single NAT gateway in one AZ. What happens if that AZ fails, and how is this fixed?
- A. Outbound traffic switches to the internet gateway automatically until the AZ recovers
- B. Instances in other AZs lose internet access; create a NAT gateway in each AZ and route to it
- C. Nothing happens; a NAT gateway created in one AZ fails over to other AZs automatically
- D. Instances in other AZs lose internet access; add a second NAT gateway in the same AZ

<details><summary>Answer</summary>

**B.** A standard (zonal) NAT gateway lives in one AZ. Alternatively, a regional NAT gateway expands across AZs automatically.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>
</details>

**36.** An on-premises data center connects to AWS through a single Direct Connect link. How can this be made highly available at the lowest cost?
- A. Add a NAT gateway in each Availability Zone
- B. Peer the VPC with a second VPC in another Region
- C. Add a backup Site-to-Site VPN connection
- D. Add another Direct Connect link at the same location

<details><summary>Answer</summary>

**C.** The highest resiliency comes from multiple DX connections at separate locations. A VPN backup is the low-cost option.
Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html>
</details>

**37.** Which Aurora feature keeps six copies of data across three AZs and repairs itself automatically?
- A. Aurora Backtrack with a 72-hour window
- B. Aurora Serverless v2 capacity scaling
- C. The Aurora cluster storage volume
- D. Aurora Auto Scaling for Aurora Replicas

<details><summary>Answer</summary>

**C.** The storage survives the loss of 2 copies for writes and 3 copies for reads. Up to 15 Aurora Replicas can be promoted during failover.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html>
</details>

**38.** A company wants to test how its workload behaves when AZs fail or instances are terminated, in a controlled way. Which service should it use?
- A. Amazon Inspector network reachability findings
- B. AWS Trusted Advisor fault tolerance checks
- C. AWS X-Ray service maps and traces
- D. AWS Fault Injection Service (FIS)

<details><summary>Answer</summary>

**D.**
Resource: <https://docs.aws.amazon.com/fis/latest/userguide/what-is.html>
</details>

**39.** A DynamoDB table must be recoverable to any second in the last 35 days. What should be enabled?
- A. DynamoDB Streams processed into S3 by Lambda
- B. Time to Live (TTL) on each item
- C. Point-in-time recovery (PITR)
- D. Daily on-demand backups started by EventBridge

<details><summary>Answer</summary>

**C.** PITR restores to any second in the recovery period (1–35 days, default 35).
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html>
</details>

**40.** Operations wants end-to-end tracing to find which microservice causes latency spikes and errors. Which service helps?
- A. AWS X-Ray
- B. VPC Flow Logs
- C. AWS Config
- D. AWS CloudTrail

<details><summary>Answer</summary>

**A.**
Resource: <https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html>
</details>
