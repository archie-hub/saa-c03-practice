# Domain 2: Design Resilient Architectures (26%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain2.html>

---

## Task 2.1: Design scalable and loosely coupled architectures

**1.** An order-processing web tier normally handles steady traffic, but every Black Friday it spikes hard enough to overwhelm the backend workers, and some orders are silently lost. The web tier already uses Route 53 weighted routing to split traffic between two identical stacks, which hasn't helped with this particular problem. What design change decouples the tiers and prevents lost orders?
- A. Add more EC2 instances to the web tier and turn on cross-zone load balancing
- B. Move the backend database to a larger RDS instance class with Provisioned IOPS
- C. Send orders to an Amazon SQS queue and scale the workers on queue depth
- D. Add a second, equally weighted Route 53 record so traffic splits three ways

<details><summary>Answer</summary>

**C.** SQS buffers messages so workers can process them at their own pace instead of dropping requests during a spike. Scale the worker fleet on `ApproximateNumberOfMessagesVisible` (backlog per instance) rather than on web-tier metrics.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>
</details>

**2.** A bank's statement-generation system must process each customer's transactions exactly once and strictly in the order they were submitted, even though transactions for thousands of different customers arrive interleaved on the same pipeline. Which queue type should be used, and how?
- A. Amazon Data Firehose, partitioned by customer ID
- B. An SQS FIFO queue, using the customer ID as the message group ID
- C. An SQS standard queue, using the customer ID as a message attribute
- D. An SNS standard topic with a subscription filter on the customer ID

<details><summary>Answer</summary>

**B.** FIFO queues preserve order within a message group and deduplicate messages, so using the customer ID as the group ID keeps each customer's transactions in order without mixing them with other customers'.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html>
</details>

**3.** A single "order placed" event must reach three independent systems — billing, shipping, and analytics — each of which processes it at its own pace, and a slowdown in one system (analytics has been known to lag for hours during nightly jobs) must never hold up the other two. What is the BEST pattern?
- A. Three Lambda functions called in sequence, one for each downstream system
- B. One SQS queue polled by all three systems
- C. A shared EFS file that each system reads on a schedule
- D. An SNS topic that fans out to three separate SQS queues

<details><summary>Answer</summary>

**D.** SNS-to-SQS fan-out delivers one copy of the event to each queue, so billing, shipping, and analytics each consume independently and a backlog in one queue has no effect on the others.
Resource: <https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html>
</details>

**4.** A particular malformed order keeps failing processing, gets returned to the queue each time, and is repeatedly picked up ahead of newer, valid orders, effectively blocking the rest of the work. What should be configured to stop this?
- A. Short polling with a smaller `ReceiveMessage` batch size
- B. A longer message retention period on the source queue
- C. A dead-letter queue (DLQ) with a `maxReceiveCount` redrive policy
- D. A delivery delay that postpones new messages by 15 minutes

<details><summary>Answer</summary>

**C.** After a message fails a set number of receives (`maxReceiveCount`), the redrive policy moves it to a DLQ instead of leaving it to block the head of the queue, so healthy messages keep flowing.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html>
</details>

**5.** A video-transcoding consumer occasionally takes longer to process a message than expected, and the team notices the same video sometimes gets transcoded twice by two different workers. What should be adjusted to stop this duplicate processing?
- A. Decrease the retention period so that messages expire sooner
- B. Increase the visibility timeout so it comfortably exceeds the worst-case processing time
- C. Increase the delivery delay so that messages arrive later
- D. Enable long polling by setting `WaitTimeSeconds` to 20

<details><summary>Answer</summary>

**B.** If a message isn't deleted before the visibility timeout expires, SQS makes it visible to other consumers again, causing duplicate processing. Setting the timeout comfortably above the worst-case processing time prevents that.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html>
</details>

**6.** A cost review shows that a fleet of consumers polling an SQS queue spends most of its API calls on empty `ReceiveMessage` responses, and the team wants to cut both the empty responses and the API costs that come with them, without changing how quickly messages are picked up in practice. What should be enabled?
- A. A dead-letter queue with a low `maxReceiveCount`
- B. Message timers that delay each message by 15 minutes
- C. Long polling, with `WaitTimeSeconds` set up to 20 seconds
- D. A FIFO queue with content-based deduplication

<details><summary>Answer</summary>

**C.** Long polling keeps the connection open for up to 20 seconds waiting for a message to arrive, instead of returning immediately with an empty response, which sharply cuts the number of empty polls and their cost.
Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html>
</details>

**7.** A loan-approval workflow has several steps with retries and branching logic, includes a human-approval step, and can sit in a "waiting on the applicant's documents" state for up to several months before continuing. Which service should orchestrate this, and which workflow type?
- A. EventBridge Scheduler, with one schedule created per step
- B. An SQS queue with a separate Lambda consumer for each step
- C. AWS Step Functions Express workflows
- D. AWS Step Functions Standard workflows

<details><summary>Answer</summary>

**D.** Standard workflows can run for up to a year and are built for exactly this kind of long-running, auditable process with waits and human approval. Express workflows (wrong here) are for high-volume executions that complete within 5 minutes.
Resource: <https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html>
</details>

**8.** A company ingests support-ticket events from a SaaS partner (Zendesk) alongside native AWS service events, such as EC2 state changes, and needs to route both kinds of events to different targets based on rules that inspect the event content — for example, only high-priority tickets go to an on-call Lambda function. Which service should be used?
- A. Amazon EventBridge
- B. Amazon MQ, with a separate broker per partner
- C. Amazon SNS with subscription filter policies
- D. AWS AppSync with a subscription for each target

<details><summary>Answer</summary>

**A.** EventBridge supports partner event sources like Zendesk alongside native AWS events, and its rules can filter and route based on event content to multiple targets.
Resource: <https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html>
</details>

**9.** A company is migrating an on-premises order-routing application built on Apache ActiveMQ, which its clients talk to using the AMQP and MQTT protocols, and the migration deadline doesn't allow time to rewrite the messaging client code. Which service should it use?
- A. Amazon SNS
- B. Amazon Kinesis
- C. Amazon SQS
- D. Amazon MQ

<details><summary>Answer</summary>

**D.** Amazon MQ is a managed message broker for Apache ActiveMQ and RabbitMQ that supports standard protocols including AMQP and MQTT, letting existing clients connect with little to no code change.
Resource: <https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html>
</details>

**10.** A stateless web application runs on EC2 behind an ALB, and users are randomly logged out whenever the Auto Scaling group scales in, because each instance keeps session data in local memory. What is the BEST fix for scalability?
- A. Turn on sticky sessions on the ALB with a long cookie duration
- B. Store session state externally in ElastiCache or DynamoDB
- C. Turn off scale-in on the Auto Scaling group during business hours
- D. Use larger instances so that fewer of them are needed at peak

<details><summary>Answer</summary>

**B.** Keeping session state out of the instances and in a shared, external store lets any instance serve any request, so scaling in no longer logs users out.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/elasticache-use-cases.html>
</details>

**11.** A new API's traffic is completely unpredictable — anywhere from zero requests overnight to several thousand per second during a product launch — and the small team maintaining it doesn't want to manage or patch any servers. What is the BEST architecture?
- A. AWS Elastic Beanstalk with a single-instance environment
- B. Amazon API Gateway, AWS Lambda, and DynamoDB in on-demand mode
- C. EC2 instances in an Auto Scaling group with an Amazon RDS database
- D. Amazon ECS on EC2 with a fixed number of container instances

<details><summary>Answer</summary>

**B.** This combination scales automatically from zero to very high request rates with nothing to provision or patch, unlike the other options, which all involve managing servers or fixed capacity.
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html>
</details>

**12.** A company wants to run its existing container images without managing the underlying EC2 instances or clusters at all — no patching, no capacity planning for the cluster itself. What should it use?
- A. Amazon ECS or Amazon EKS with AWS Fargate
- B. AWS Batch with a managed EC2 Spot compute environment
- C. Amazon ECS with an EC2 Auto Scaling group capacity provider
- D. Amazon Lightsail instances with Docker installed

<details><summary>Answer</summary>

**A.** Fargate is a serverless compute engine for containers: ECS or EKS schedules the containers, and there are no EC2 instances for the customer to provision or manage.
Resource: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>
</details>

**13.** An API backend has usage plans in place for billing purposes, but a single misbehaving client recently sent a burst of requests that briefly degraded the service for everyone else. Which API Gateway feature specifically protects against a single client sending too many requests too quickly?
- A. Usage plans with throttling limits and API keys
- B. Canary release deployments on the production stage
- C. Mapping templates that validate the request body
- D. Stage-level response caching with a long TTL

<details><summary>Answer</summary>

**A.** Usage plans tied to API keys let you set per-client throttling (rate and burst) limits, so one client's traffic spike can't consume the capacity other clients depend on.
Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html>
</details>

**14.** An image-upload service must generate thumbnails as soon as images land in an S3 bucket, and the team wants the least coupling possible between the upload path and the thumbnail generator — no polling, and no component needing to know about the other's schedule. What is the BEST approach?
- A. A cron job on an EC2 instance that lists the bucket every minute
- B. S3 event notifications (or EventBridge) that invoke a Lambda function
- C. S3 Replication to a second bucket that's configured for thumbnails
- D. The web tier polls the bucket after each upload and resizes the image itself

<details><summary>Answer</summary>

**B.** S3 event notifications trigger the Lambda function the moment an object is created, with no polling and no direct dependency between the upload path and the thumbnail generator.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html>
</details>

**15.** A serverless application's Lambda functions open far more connections to an RDS for MySQL database than the instance can handle whenever a marketing push causes a burst of concurrent invocations, and the database starts refusing new connections. What fixes this?
- A. Amazon RDS Proxy
- B. A larger RDS instance class
- C. Multi-AZ
- D. Read replicas

<details><summary>Answer</summary>

**A.** RDS Proxy pools and shares a smaller number of underlying database connections across many Lambda invocations, and it also speeds up failover. A bigger instance class or more replicas don't solve a connection-exhaustion problem by themselves.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html>
</details>

**16.** A product-catalog page reads the same handful of popular items thousands of times a minute, and those rows change only a few times a day. The team wants to take that repetitive read load off the database and cut response latency. Which service should be used?
- A. Amazon EFS with Elastic Throughput
- B. AWS Global Accelerator in front of the database
- C. Amazon ElastiCache (Redis OSS or Memcached)
- D. Amazon S3 with S3 Intelligent-Tiering

<details><summary>Answer</summary>

**C.** ElastiCache caches frequently read, rarely changed query results in memory, cutting both database load and response latency for hot reads.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html>
</details>

**17. (Select TWO.)** A team reviewing their architecture diagram, which still shows tiers calling each other over hard-coded internal IP addresses and sharing a local disk for hand-off files, wants to identify what a genuinely loosely coupled design should look like instead. Which TWO are characteristics of a loosely coupled architecture?
- A. A failure in one component cascades to all the others
- B. Components share a local disk for hand-off files
- C. Components can scale independently of each other
- D. Tiers communicate using hard-coded IP addresses
- E. Components communicate through queues or events rather than direct calls

<details><summary>Answer</summary>

**C, E.** Loose coupling means components don't need to know each other's location or scaling state — they exchange work through queues or events, and each can scale on its own. Shared disks, hard-coded IPs, and cascading failures are all signs of tight coupling.
Resource: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html>
</details>

**18.** A company has dozens of microservices spread across different VPCs and AWS accounts, and wants them to call each other over HTTP with built-in service discovery and IAM-based authorization — without a mesh of VPC peering connections or a fleet of load balancers to manage. What fits BEST?
- A. Amazon VPC Lattice
- B. AWS Direct Connect
- C. A full-mesh VPC peering topology between every pair of services
- D. A NAT gateway shared across accounts

<details><summary>Answer</summary>

**A.** VPC Lattice provides application-layer networking — service discovery, routing, and IAM authorization — across VPCs and accounts, without peering connections or managing individual load balancers per service.
Resource: <https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html>
</details>

**19.** A team wants an EC2 Auto Scaling policy that keeps average CPU utilization at 50% across the fleet, using the least configuration effort and without hand-picking alarm thresholds or step adjustments. Which scaling policy fits?
- A. Step scaling with several CloudWatch alarms at different thresholds
- B. Scheduled scaling actions that run every hour
- C. Simple scaling with a single CloudWatch alarm
- D. Target tracking scaling

<details><summary>Answer</summary>

**D.** Target tracking scaling automatically creates and manages the underlying CloudWatch alarms to hold a metric like average CPU at a target value, which is far less configuration than step or simple scaling.
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
</details>

**20.** A retailer's traffic rises sharply at 8 AM every weekday as employees log in to place bulk orders, but a new instance in the Auto Scaling group takes about 10 minutes to finish booting and warming its application cache before it can serve traffic. What avoids slow responses right at the start of the day?
- A. Target tracking on request count per target with a very low target value
- B. Scheduled (or predictive) scaling combined with a warm pool
- C. Simple scaling on CPU utilization with a lower alarm threshold
- D. A longer default cooldown so that new instances aren't terminated too soon

<details><summary>Answer</summary>

**B.** Because the traffic pattern is predictable, scheduled or predictive scaling can add capacity before 8 AM, and a warm pool keeps pre-initialized instances ready so they don't need the full 10-minute boot-and-warm-up cycle when traffic arrives.
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html>
</details>

---

## Task 2.2: Design highly available and/or fault-tolerant architectures

**21.** A production Amazon RDS for MySQL database backs a payment system with a strict requirement to keep accepting writes, with automatic failover, if an entire Availability Zone becomes unavailable. The team already takes automated daily backups, which satisfies a separate recovery-point requirement but not this one. What should be enabled?
- A. A read replica placed in the same AZ as the primary
- B. Multi-AZ deployment
- C. A larger instance class
- D. Automated backups only

<details><summary>Answer</summary>

**B.** Multi-AZ keeps a synchronous standby in a different AZ and fails over to it automatically, typically within 60–120 seconds, while the database's DNS endpoint stays the same.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
</details>

**22.** A team debating their RDS architecture disagrees about what a read replica actually gives them versus what Multi-AZ gives them. What is the main purpose of an RDS read replica compared with Multi-AZ?
- A. Read replicas scale reads with asynchronous replication; Multi-AZ provides high availability
- B. Multi-AZ standbys serve reads in every database engine; read replicas exist only for backups
- C. Read replicas provide automatic failover by default; Multi-AZ is for scaling reads
- D. Both use synchronous replication, but only read replicas can be placed in another Region

<details><summary>Answer</summary>

**A.** Read replicas use asynchronous replication and are meant to offload read traffic; Multi-AZ maintains a synchronous standby purely for high availability and automatic failover. (A Multi-AZ DB cluster deployment, with two readable standbys, is the exception that can also serve reads.)
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
</details>

**23.** A web application currently runs as two EC2 instances in the same Availability Zone behind an Application Load Balancer, and it must keep running even if that entire AZ fails. What is the minimum correct design change?
- A. A single instance with CloudWatch alarm-based automatic recovery
- B. An Auto Scaling group spanning at least two AZs behind an ALB
- C. Keep the two instances in the same AZ, but add a second Application Load Balancer as backup
- D. One large EC2 instance with an Elastic IP address attached

<details><summary>Answer</summary>

**B.** Spreading instances across at least two AZs in an Auto Scaling group means the loss of one AZ still leaves capacity running in another, which two instances in a single AZ can't provide no matter how many load balancers front them.
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-availability-zone-balanced.html>
</details>

**24.** A company's internal reporting workload can tolerate being unavailable for a few hours and losing a few hours of data if its Region ever fails, and leadership has explicitly said the DR solution must be the cheapest option that still meets that RTO and RPO. Which DR strategy fits?
- A. Multi-site active/active
- B. Pilot light
- C. Backup and restore
- D. Warm standby

<details><summary>Answer</summary>

**C.** Ordered roughly by cost and by RTO/RPO: backup and restore (hours), pilot light (tens of minutes), warm standby (minutes), then multi-site active/active (near zero) — backup and restore is the cheapest option that still meets an hours-level target.
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**25.** In a company's DR plan, the core databases stay continuously replicated to the DR Region around the clock, but the application servers there are kept switched off and are only launched from AMIs once a disaster is declared. Which strategy is this?
- A. Active/active
- B. Warm standby
- C. Pilot light
- D. Backup and restore

<details><summary>Answer</summary>

**C.** In pilot light, the critical data (like a database) is kept continuously up to date in the DR Region, while the compute layer sits idle until it's needed and is then quickly launched.
Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**26.** A global trading application needs a relational database where cross-Region replication typically lags by well under a second, and where, if the primary Region goes down, a secondary Region's cluster can be promoted to take over within minutes rather than hours. What fits?
- A. RDS Multi-AZ DB cluster
- B. RDS cross-Region snapshot copies, restored on demand
- C. DynamoDB global tables
- D. Amazon Aurora Global Database

<details><summary>Answer</summary>

**D.** Aurora Global Database typically replicates across Regions in under a second and lets a secondary Region be promoted to full read/write within about a minute, which snapshot copies or a single-Region Multi-AZ cluster can't match.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html>
</details>

**27.** A social app has active users on several continents and needs its NoSQL user-profile store to accept writes with low latency close to each user, with those writes visible from any Region shortly afterward. Which option fits?
- A. RDS read replicas in each Region
- B. Amazon ElastiCache in each Region, backed by a single database
- C. A single-Region DynamoDB table plus DAX for caching
- D. DynamoDB global tables

<details><summary>Answer</summary>

**D.** DynamoDB global tables replicate a table across chosen Regions and accept writes in any of them (multi-active), which is exactly what's needed for low-latency, multi-Region writes — a single-Region table, even with DAX, still funnels every write through one Region.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html>
</details>

**28.** A company's primary application endpoint is in `us-east-1`, with a fully provisioned but idle standby stack in `us-west-2`. Users should be sent to the standby automatically, without a manual DNS change, whenever the primary endpoint fails its health check. Which Route 53 routing policy should be used?
- A. Geolocation routing only
- B. Weighted routing with equal weights and no health checks
- C. Failover routing with health checks
- D. Simple routing with multiple IP addresses returned in random order

<details><summary>Answer</summary>

**C.** Failover routing designates a primary and a secondary record; Route 53 monitors the primary's health check and automatically starts answering with the secondary the moment the primary is unhealthy.
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html>
</details>

**29.** A video-streaming company runs identical stacks in three Regions and wants each viewer's DNS query answered with whichever Region will give that viewer the fastest connection, based on measured network conditions rather than the viewer's geographic location. Which Route 53 routing policy fits?
- A. Weighted routing
- B. Latency-based routing
- C. Geolocation routing
- D. Multivalue answer routing

<details><summary>Answer</summary>

**B.** Latency-based routing answers with the Region that gives the lowest measured network latency for that resolver, which is a better fit here than geolocation routing (based on the viewer's location, not measured latency).
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html>
</details>

**30.** A multiplayer game with a TCP/UDP protocol needs static IP addresses that never change (so they can be safely allow-listed by corporate firewalls) and failover to a healthy Region in well under a minute if a Region degrades. What should it use?
- A. Amazon CloudFront
- B. Route 53 simple routing
- C. A Network Load Balancer in a single Region
- D. AWS Global Accelerator

<details><summary>Answer</summary>

**D.** Global Accelerator provides static anycast IP addresses that don't change, and it reroutes traffic to a healthy endpoint group within seconds of a health check failing — and it works for TCP/UDP, unlike CloudFront, which is HTTP(S)-focused.
Resource: <https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html>
</details>

**31.** A rendering farm of Linux EC2 instances spread across three Availability Zones all need to read and write the same shared project files concurrently, and the file system must keep working even if one of those AZs is lost. What should be used?
- A. An EBS volume with Multi-Attach
- B. Amazon EFS (Regional)
- C. Instance store on each instance
- D. Amazon EFS One Zone

<details><summary>Answer</summary>

**B.** Regional EFS is a shared, POSIX-compliant file system that can be mounted concurrently from instances in multiple AZs and stores data redundantly across AZs, unlike EFS One Zone, instance store, or EBS Multi-Attach (which is also limited to a single AZ).
Resource: <https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html>
</details>

**32.** Instances in an Auto Scaling group keep getting marked healthy by the default EC2 status checks even during an incident where the application itself is returning HTTP 500 errors on every request, so unhealthy instances never get replaced automatically. What fixes this?
- A. Move to a larger instance type to reduce the errors
- B. Add a scheduled action that replaces every instance nightly
- C. Turn off health checks entirely so instances aren't replaced mid-incident
- D. Turn on ELB health checks for the Auto Scaling group

<details><summary>Answer</summary>

**D.** EC2 status checks only detect infrastructure-level problems with the instance, not application-level failures. ELB health checks let the load balancer's health check (which can probe an actual application endpoint) drive instance replacement instead.
Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html>
</details>

**33.** A company must keep a continuously updated copy of its S3 objects in a second Region for both compliance and disaster recovery, and wants 99.99% of new objects to be copied within 15 minutes of being written. What is required?
- A. S3 Cross-Region Replication, with versioning enabled on both buckets, and Replication Time Control (RTC) turned on
- B. S3 Transfer Acceleration, enabled on the source bucket
- C. A CloudFront distribution that uses the source bucket as its origin
- D. A lifecycle rule that transitions objects to the other Region after 30 days

<details><summary>Answer</summary>

**A.** Cross-Region Replication requires versioning on both the source and destination buckets, and Replication Time Control adds the 15-minute, 99.99% SLA the requirement calls for.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html>
</details>

**34.** A company wants to replicate its on-premises servers to AWS continuously at the block level for disaster recovery, targeting an RPO measured in seconds and an RTO measured in minutes, with the ability to fail back to on-premises once the incident is resolved. Which service should it use?
- A. AWS Elastic Disaster Recovery (AWS DRS)
- B. AWS Application Migration Service (MGN)
- C. AWS DataSync tasks scheduled every hour
- D. AWS Backup with an hourly backup plan

<details><summary>Answer</summary>

**A.** AWS DRS keeps servers continuously replicated for ongoing recovery readiness and supports failback. Application Migration Service uses similar underlying replication technology but is designed for one-time lift-and-shift migrations, not standing DR.
Resource: <https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html>
</details>

**35.** A VPC has instances in three Availability Zones, but only one NAT gateway, deployed in AZ-a's public subnet. During a maintenance event, AZ-a becomes unavailable. What happens to instances in the other AZs, and how should this be fixed going forward?
- A. Nothing; outbound traffic switches to the internet gateway automatically until AZ-a recovers
- B. Instances in the other AZs lose internet access; the fix is to create a NAT gateway in each AZ and route to the local one
- C. Nothing; a NAT gateway created in one AZ fails over to other AZs automatically
- D. Instances in the other AZs lose internet access; the fix is to add a second NAT gateway in AZ-a

<details><summary>Answer</summary>

**B.** A standard (zonal) NAT gateway lives entirely in one AZ, so instances in other AZs that route through it lose outbound connectivity if that AZ is impaired. The standard fix is one NAT gateway per AZ, with each AZ's private subnets routing to the NAT gateway in the same AZ. (A regional NAT gateway is a newer alternative that spans AZs automatically.)
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>
</details>

**36.** A company connects its on-premises data center to AWS through a single AWS Direct Connect link at one location, and a recent fiber cut at that location caused a multi-hour outage. Leadership wants this made highly available, but has capped the budget and explicitly ruled out a second physical Direct Connect circuit for now. What should be added?
- A. A NAT gateway in each Availability Zone
- B. A VPC peering connection to a second VPC in another Region
- C. AWS Transit Gateway with a second attachment in the same Region
- D. A backup AWS Site-to-Site VPN connection

<details><summary>Answer</summary>

**D.** The most resilient option is a second Direct Connect connection at a separate location, but since that's ruled out, a Site-to-Site VPN as a backup path is the standard lower-cost way to add resiliency to a single DX link.
Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html>
</details>

**37.** During an incident review, an engineer claims that Aurora Replicas are the reason the database "healed itself" after two storage nodes failed. A colleague points out that's not quite right. Which Aurora feature actually keeps six copies of data across three AZs and repairs itself automatically, independent of how many read replicas exist?
- A. Aurora Backtrack with a 72-hour window
- B. Aurora Serverless v2 capacity scaling
- C. The Aurora cluster storage volume
- D. Aurora Auto Scaling for Aurora Replicas

<details><summary>Answer</summary>

**C.** The Aurora cluster storage volume itself maintains six copies across three AZs and self-heals, tolerating the loss of up to two copies for writes and three for reads — this is separate from Aurora Replicas, Backtrack, or Serverless scaling.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html>
</details>

**38.** Before their next major release, a team wants to deliberately and safely simulate an Availability Zone failure and random instance terminations against their production-like environment, to see how the workload actually behaves — not just review dashboards after the fact. Which service should they use?
- A. Amazon Inspector network reachability findings
- B. AWS Trusted Advisor fault tolerance checks
- C. AWS X-Ray service maps and traces
- D. AWS Fault Injection Service (FIS)

<details><summary>Answer</summary>

**D.** AWS FIS runs controlled chaos-engineering experiments, such as simulating AZ impairment or terminating instances, so teams can observe real behavior under failure conditions rather than just reviewing static findings or traces.
Resource: <https://docs.aws.amazon.com/fis/latest/userguide/what-is.html>
</details>

**39.** A support team accidentally ran a script that overwrote thousands of items in a DynamoDB table at 2:17 PM, and needs to restore the table to exactly how it looked one minute before that happened. The table must generally be recoverable to any second within the last 35 days. What should be enabled?
- A. DynamoDB Streams processed into S3 by Lambda
- B. Time to Live (TTL) on each item
- C. Point-in-time recovery (PITR)
- D. Daily on-demand backups started by EventBridge

<details><summary>Answer</summary>

**C.** PITR continuously backs up the table and can restore it to any second within the retention window (1–35 days, 35 by default) — precise enough to restore to 2:16 PM, which daily snapshots can't do.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html>
</details>

**40.** After splitting a monolith into a dozen microservices, operations can no longer tell which specific service is responsible for the latency spikes and intermittent errors customers are reporting, since each request now hops through several services before returning a response. Which service helps pinpoint that?
- A. AWS X-Ray
- B. VPC Flow Logs
- C. AWS Config
- D. AWS CloudTrail

<details><summary>Answer</summary>

**A.** X-Ray traces a request end-to-end across services and builds a service map showing where time is spent and where errors occur, which VPC Flow Logs, Config, and CloudTrail aren't designed to do.
Resource: <https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html>
</details>
