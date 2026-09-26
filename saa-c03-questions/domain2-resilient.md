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

Why not the others:
- **A.** More web servers don't help when the backend workers are the bottleneck. Nothing buffers the orders, so they're still dropped.
- **B.** A bigger database doesn't buffer bursts of orders. The workers are still overwhelmed and still drop them.
- **D.** Another DNS record only splits traffic across stacks. Each stack's backend can still be overwhelmed, and nothing holds orders until workers are ready.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html>
</details>

**2.** A bank's statement-generation system must process each customer's transactions exactly once and strictly in the order they were submitted, even though transactions for thousands of different customers arrive interleaved on the same pipeline. Which queue type should be used, and how?
- A. Amazon Data Firehose, partitioned by customer ID
- B. An SQS FIFO queue, using the customer ID as the message group ID
- C. An SQS standard queue, using the customer ID as a message attribute
- D. An SNS standard topic with a subscription filter on the customer ID

<details><summary>Answer</summary>

**B.** FIFO queues preserve order within a message group and deduplicate messages, so using the customer ID as the group ID keeps each customer's transactions in order without mixing them with other customers'.

Why not the others:
- **A.** Data Firehose delivers streaming data to storage and analytics destinations. It isn't a work queue with exactly-once, per-customer ordered processing.
- **C.** Standard queues deliver at least once with best-effort ordering. A message attribute doesn't change that.
- **D.** SNS standard topics don't guarantee ordering or exactly-once delivery. Filter policies only decide which subscribers get a message.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html>
</details>

**3.** A single "order placed" event must reach three independent systems — billing, shipping, and analytics — each of which processes it at its own pace, and a slowdown in one system (analytics has been known to lag for hours during nightly jobs) must never hold up the other two. What is the BEST pattern?
- A. Three Lambda functions called in sequence, one for each downstream system
- B. One SQS queue polled by all three systems
- C. A shared EFS file that each system reads on a schedule
- D. An SNS topic that fans out to three separate SQS queues

<details><summary>Answer</summary>

**D.** SNS-to-SQS fan-out delivers one copy of the event to each queue, so billing, shipping, and analytics each consume independently and a backlog in one queue has no effect on the others.

Why not the others:
- **A.** Calling the systems in sequence couples them: a slow analytics step delays everything after it, and one failure breaks the chain.
- **B.** With one queue, each message is consumed by only one consumer, so each system would see just a share of the events.
- **C.** A shared file needs polling and locking, isn't event-driven, and tightly couples all three systems.

Resource: <https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html>
</details>

**4.** A particular malformed order keeps failing processing, gets returned to the queue each time, and is repeatedly picked up ahead of newer, valid orders, effectively blocking the rest of the work. What should be configured to stop this?
- A. Short polling with a smaller `ReceiveMessage` batch size
- B. A longer message retention period on the source queue
- C. A dead-letter queue (DLQ) with a `maxReceiveCount` redrive policy
- D. A delivery delay that postpones new messages by 15 minutes

<details><summary>Answer</summary>

**C.** After a message fails a set number of receives (`maxReceiveCount`), the redrive policy moves it to a DLQ instead of leaving it to block the head of the queue, so healthy messages keep flowing.

Why not the others:
- **A.** Polling mode and batch size change how messages are fetched, not what happens to a message that keeps failing.
- **B.** A longer retention period only keeps the bad message around for longer.
- **D.** A delivery delay postpones every new message. The failing message still comes back again and again.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html>
</details>

**5.** A video-transcoding consumer occasionally takes longer to process a message than expected, and the team notices the same video sometimes gets transcoded twice by two different workers. What should be adjusted to stop this duplicate processing?
- A. Decrease the retention period so that messages expire sooner
- B. Raise the visibility timeout above the worst-case processing time
- C. Increase the delivery delay so that messages arrive later
- D. Enable long polling by setting `WaitTimeSeconds` to 20

<details><summary>Answer</summary>

**B.** If a message isn't deleted before the visibility timeout expires, SQS makes it visible to other consumers again, causing duplicate processing. Setting the timeout comfortably above the worst-case processing time prevents that.

Why not the others:
- **A.** Retention controls how long unprocessed messages are kept. Shortening it risks losing messages and doesn't stop redelivery during processing.
- **C.** A delivery delay only applies before a message is first delivered. It doesn't stop the message reappearing while a worker is still processing it.
- **D.** Long polling reduces empty responses. It has no effect on messages being processed twice.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html>
</details>

**6.** A cost review shows that a fleet of consumers polling an SQS queue spends most of its API calls on empty `ReceiveMessage` responses, and the team wants to cut both the empty responses and the API costs that come with them, without changing how quickly messages are picked up in practice. What should be enabled?
- A. A dead-letter queue with a low `maxReceiveCount`
- B. Message timers that delay each message by 15 minutes
- C. Long polling, with `WaitTimeSeconds` set up to 20 seconds
- D. A FIFO queue with content-based deduplication

<details><summary>Answer</summary>

**C.** Long polling keeps the connection open for up to 20 seconds waiting for a message to arrive, instead of returning immediately with an empty response, which sharply cuts the number of empty polls and their cost.

Why not the others:
- **A.** A dead-letter queue handles messages that keep failing. It doesn't reduce empty receives.
- **B.** Message timers delay every message by up to 15 minutes, which slows pickup, against the requirement.
- **D.** FIFO deduplication prevents duplicate messages. It doesn't reduce empty `ReceiveMessage` responses.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html>
</details>

**7.** A loan-approval workflow has several steps with retries and branching logic, includes a human-approval step, and can sit in a "waiting on the applicant's documents" state for up to several months before continuing. Which service should orchestrate this, and which workflow type?
- A. EventBridge Scheduler, with one schedule created per step
- B. An SQS queue with a separate Lambda consumer for each step
- C. AWS Step Functions Express workflows
- D. AWS Step Functions Standard workflows

<details><summary>Answer</summary>

**D.** Standard workflows can run for up to a year and are built for exactly this kind of long-running, auditable process with waits and human approval. Express workflows (wrong here) are for high-volume executions that complete within 5 minutes.

Why not the others:
- **A.** EventBridge Scheduler triggers targets on a schedule. It doesn't orchestrate branching, retries, human approval or workflow state.
- **B.** You'd have to build state tracking, branching and approvals yourself, and SQS keeps messages for 14 days at most, far short of several months.
- **C.** Express workflows run for at most 5 minutes, so they can't wait months for documents.

Resource: <https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html>
</details>

**8.** A company ingests support-ticket events from a SaaS partner (Zendesk) alongside native AWS service events, such as EC2 state changes, and needs to route both kinds of events to different targets based on rules that inspect the event content — for example, only high-priority tickets go to an on-call Lambda function. Which service should be used?
- A. Amazon EventBridge
- B. Amazon MQ, with a separate broker per partner
- C. Amazon SNS with subscription filter policies
- D. AWS AppSync with a subscription for each target

<details><summary>Answer</summary>

**A.** EventBridge supports partner event sources like Zendesk alongside native AWS events, and its rules can filter and route based on event content to multiple targets.

Why not the others:
- **B.** Amazon MQ is a message broker for applications using standard protocols. It has no built-in SaaS partner event sources.
- **C.** SNS can filter messages, but it has no built-in partner event sources for SaaS apps like Zendesk. EventBridge does.
- **D.** AppSync is for building GraphQL APIs, not for routing events between services.

Resource: <https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html>
</details>

**9.** A company is migrating an on-premises order-routing application built on Apache ActiveMQ, which its clients talk to using the AMQP and MQTT protocols, and the migration deadline doesn't allow time to rewrite the messaging client code. Which service should it use?
- A. Amazon SNS
- B. Amazon Kinesis
- C. Amazon SQS
- D. Amazon MQ

<details><summary>Answer</summary>

**D.** Amazon MQ is a managed message broker for Apache ActiveMQ and RabbitMQ that supports standard protocols including AMQP and MQTT, letting existing clients connect with little to no code change.

Why not the others:
- **A.** SNS is a pub/sub service with its own API. Clients would need rewriting, since it doesn't speak AMQP or MQTT as a broker.
- **B.** Kinesis is for streaming data and has its own API, so the ActiveMQ clients would need rewriting.
- **C.** SQS has its own API and doesn't support AMQP or MQTT, so the client code would need rewriting.

Resource: <https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html>
</details>

**10.** A stateless web application runs on EC2 behind an ALB, and users are randomly logged out whenever the Auto Scaling group scales in, because each instance keeps session data in local memory. What is the BEST fix for scalability?
- A. Turn on sticky sessions on the ALB with a long cookie duration
- B. Store session state externally in ElastiCache or DynamoDB
- C. Turn off scale-in on the Auto Scaling group during business hours
- D. Use larger instances so that fewer of them are needed at peak

<details><summary>Answer</summary>

**B.** Keeping session state out of the instances and in a shared, external store lets any instance serve any request, so scaling in no longer logs users out.

Why not the others:
- **A.** Sticky sessions keep a user on one instance, but the session is still lost when that instance is terminated, and load becomes uneven.
- **C.** Turning off scale-in wastes money, and sessions are still lost whenever an instance fails.
- **D.** Fewer, larger instances still keep sessions in memory, and losing one logs out even more users.

Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/elasticache-use-cases.html>
</details>

**11.** A new API's traffic is completely unpredictable — anywhere from zero requests overnight to several thousand per second during a product launch — and the small team maintaining it doesn't want to manage or patch any servers. What is the BEST architecture?
- A. AWS Elastic Beanstalk with a single-instance environment
- B. Amazon API Gateway, AWS Lambda, and DynamoDB in on-demand mode
- C. EC2 instances in an Auto Scaling group with an Amazon RDS database
- D. Amazon ECS on EC2 with a fixed number of container instances

<details><summary>Answer</summary>

**B.** This combination scales automatically from zero to very high request rates with nothing to provision or patch, unlike the other options, which all involve managing servers or fixed capacity.

Why not the others:
- **A.** A single-instance environment doesn't scale out and still means managing a server.
- **C.** EC2 instances and RDS are servers to patch and pay for even overnight at zero traffic, and they scale more slowly.
- **D.** A fixed number of EC2 container instances can't absorb unpredictable spikes, and the team still manages those servers.

Resource: <https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html>
</details>

**12.** A company wants to run its existing container images without managing the underlying EC2 instances or clusters at all — no patching, no capacity planning for the cluster itself. What should it use?
- A. Amazon ECS or Amazon EKS with AWS Fargate
- B. AWS Batch with a managed EC2 Spot compute environment
- C. Amazon ECS with an EC2 Auto Scaling group capacity provider
- D. Amazon Lightsail instances with Docker installed

<details><summary>Answer</summary>

**A.** Fargate is a serverless compute engine for containers: ECS or EKS schedules the containers, and there are no EC2 instances for the customer to provision or manage.

Why not the others:
- **B.** AWS Batch runs batch jobs, not ongoing services, and an EC2 Spot environment still runs on EC2 instances with their own AMIs and capacity settings.
- **C.** An EC2 capacity provider means the containers still run on EC2 instances that you patch and size.
- **D.** Lightsail instances are virtual servers that you patch and manage yourself.

Resource: <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html>
</details>

**13.** An API backend has usage plans in place for billing purposes, but a single misbehaving client recently sent a burst of requests that briefly degraded the service for everyone else. Which API Gateway feature specifically protects against a single client sending too many requests too quickly?
- A. Usage plans with throttling limits and API keys
- B. Canary release deployments on the production stage
- C. Mapping templates that validate the request body
- D. Stage-level response caching with a long TTL

<details><summary>Answer</summary>

**A.** Usage plans tied to API keys let you set per-client throttling (rate and burst) limits, so one client's traffic spike can't consume the capacity other clients depend on.

Why not the others:
- **B.** Canary releases split traffic between API deployments. They don't limit how fast a single client can send requests.
- **C.** Mapping templates transform request and response payloads. They don't limit request rates.
- **D.** Caching cuts backend calls for repeated identical requests, but it doesn't stop one client flooding the API.

Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html>
</details>

**14.** An image-upload service must generate thumbnails as soon as images land in an S3 bucket, and the team wants the least coupling possible between the upload path and the thumbnail generator — no polling, and no component needing to know about the other's schedule. What is the BEST approach?
- A. A cron job on an EC2 instance that lists the bucket every minute
- B. S3 event notifications (or EventBridge) that invoke a Lambda function
- C. S3 Replication to a second bucket that's configured for thumbnails
- D. The web tier polls the bucket after each upload and resizes the image itself

<details><summary>Answer</summary>

**B.** S3 event notifications trigger the Lambda function the moment an object is created, with no polling and no direct dependency between the upload path and the thumbnail generator.

Why not the others:
- **A.** Listing the bucket every minute is polling: it adds delay and cost and ties thumbnail creation to a schedule.
- **C.** Replication only copies objects to another bucket. Something still has to create the thumbnails.
- **D.** Having the web tier resize images slows down uploads and tightly couples the upload path to thumbnail creation.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html>
</details>

**15.** A serverless application's Lambda functions open far more connections to an RDS for MySQL database than the instance can handle whenever a marketing push causes a burst of concurrent invocations, and the database starts refusing new connections. What fixes this?
- A. Amazon RDS Proxy
- B. A larger RDS instance class
- C. Multi-AZ
- D. Read replicas

<details><summary>Answer</summary>

**A.** RDS Proxy pools and shares a smaller number of underlying database connections across many Lambda invocations, and it also speeds up failover. A bigger instance class or more replicas don't solve a connection-exhaustion problem by themselves.

Why not the others:
- **B.** A larger instance class allows somewhat more connections, but a burst of concurrent Lambda functions can still exhaust them.
- **C.** Multi-AZ adds a standby for failover. It doesn't let the primary accept more connections.
- **D.** Read replicas serve reads only. Writes, and the connections they need, still go to the primary.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html>
</details>

**16.** A product-catalog page reads the same handful of popular items thousands of times a minute, and those rows change only a few times a day. The team wants to take that repetitive read load off the database and cut response latency. Which service should be used?
- A. Amazon EFS with Elastic Throughput
- B. AWS Global Accelerator in front of the database
- C. Amazon ElastiCache (Redis OSS or Memcached)
- D. Amazon S3 with S3 Intelligent-Tiering

<details><summary>Answer</summary>

**C.** ElastiCache caches frequently read, rarely changed query results in memory, cutting both database load and response latency for hot reads.

Why not the others:
- **A.** EFS is shared file storage, not an in-memory cache for database query results.
- **B.** Global Accelerator improves the network path to an endpoint. It doesn't cache anything or reduce database load.
- **D.** S3 is object storage, not an in-memory cache, and Intelligent-Tiering is about storage cost.

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

Why not the others:
- **A.** Cascading failures are a sign of tight coupling. Loose coupling contains a failure within one component.
- **B.** A shared local disk ties components to the same host, which is tight coupling.
- **D.** Hard-coded IP addresses break whenever instances are replaced or scaled, which is tight coupling.

Resource: <https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html>
</details>

**18.** A company has dozens of microservices spread across different VPCs and AWS accounts, and wants them to call each other over HTTP with built-in service discovery and IAM-based authorization — without a mesh of VPC peering connections or a fleet of load balancers to manage. What fits BEST?
- A. Amazon VPC Lattice
- B. AWS Direct Connect
- C. A full-mesh VPC peering topology between every pair of services
- D. A NAT gateway shared across accounts

<details><summary>Answer</summary>

**A.** VPC Lattice provides application-layer networking — service discovery, routing, and IAM authorization — across VPCs and accounts, without peering connections or managing individual load balancers per service.

Why not the others:
- **B.** Direct Connect links an on-premises network to AWS. It doesn't connect services to each other across VPCs.
- **C.** A full mesh of peering connections grows quickly with each new VPC and provides no service discovery or IAM authorization.
- **D.** A NAT gateway gives private subnets outbound internet access. It provides no service discovery, routing between services or IAM authorization.

Resource: <https://docs.aws.amazon.com/vpc-lattice/latest/ug/what-is-vpc-lattice.html>
</details>

**19.** A team wants an EC2 Auto Scaling policy that keeps average CPU utilization at 50% across the fleet, using the least configuration effort and without hand-picking alarm thresholds or step adjustments. Which scaling policy fits?
- A. Step scaling with several CloudWatch alarms at different thresholds
- B. Scheduled scaling actions that run every hour
- C. Simple scaling with a single CloudWatch alarm
- D. Target tracking scaling

<details><summary>Answer</summary>

**D.** Target tracking scaling automatically creates and manages the underlying CloudWatch alarms to hold a metric like average CPU at a target value, which is far less configuration than step or simple scaling.

Why not the others:
- **A.** Step scaling works, but you define the CloudWatch alarms and step adjustments yourself, which is more configuration.
- **B.** Scheduled scaling changes capacity at set times. It doesn't respond to actual CPU utilization.
- **C.** Simple scaling needs you to create the alarm and the adjustment, and it waits out a cooldown between each change.

Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html>
</details>

**20.** A retailer's traffic rises sharply at 8 AM every weekday as employees log in to place bulk orders, but a new instance in the Auto Scaling group takes about 10 minutes to finish booting and warming its application cache before it can serve traffic. What avoids slow responses right at the start of the day?
- A. Target tracking on request count per target with a very low target value
- B. Scheduled (or predictive) scaling combined with a warm pool
- C. Simple scaling on CPU utilization with a lower alarm threshold
- D. A longer default cooldown so that new instances aren't terminated too soon

<details><summary>Answer</summary>

**B.** Because the traffic pattern is predictable, scheduled or predictive scaling can add capacity before 8 AM, and a warm pool keeps pre-initialized instances ready so they don't need the full 10-minute boot-and-warm-up cycle when traffic arrives.

Why not the others:
- **A.** Target tracking still reacts after traffic arrives, and new instances still take 10 minutes to become ready.
- **C.** A CPU alarm still reacts only after load rises, so users wait for the 10-minute boot.
- **D.** The cooldown controls how often scaling happens. It doesn't make new instances ready any sooner.

Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html>
</details>

**41.** A logistics company runs a self-managed Apache Kafka cluster on premises that dozens of producer and consumer applications use for shipment events. The team is tired of patching brokers and rebalancing partitions by hand, and wants to move to AWS without rewriting any producer or consumer code, which uses the standard Kafka client libraries. What should they use?
- A. Amazon Kinesis Data Streams with the Kinesis Client Library
- B. Amazon SQS FIFO queues, one for each Kafka topic
- C. Amazon MSK (Managed Streaming for Apache Kafka)
- D. Amazon MQ brokers running Apache ActiveMQ

<details><summary>Answer</summary>

**C.** Amazon MSK runs Apache Kafka for you, handling the brokers and their patching, and existing applications keep using the standard Kafka APIs and client libraries without code changes.

Why not the others:
- **A.** Kinesis Data Streams has its own API, so every Kafka producer and consumer would need rewriting.
- **B.** SQS has its own API and a different model from Kafka topics and partitions, so the applications would need rewriting.
- **D.** Amazon MQ runs ActiveMQ and RabbitMQ brokers, not Kafka, so the Kafka clients couldn't connect to it.

Resource: <https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html>
</details>

**42.** A sports app shows live match scores. The mobile and web clients fetch data through a single GraphQL API that combines results from DynamoDB and two Lambda-backed services, and when a score changes, every subscribed client must see it within a second or two without polling. The team doesn't want to run its own GraphQL or WebSocket servers. What should they use?
- A. AWS AppSync with GraphQL subscriptions
- B. Amazon API Gateway REST APIs polled by each client
- C. Amazon SNS mobile push notifications for every change
- D. Amazon Kinesis Data Streams read directly by each client

<details><summary>Answer</summary>

**A.** AppSync is a managed GraphQL service that can combine several data sources behind one API, and its subscriptions push updates to connected clients in real time over WebSockets that AppSync manages.

Why not the others:
- **B.** REST APIs polled by clients mean constant requests and delayed updates, and they don't provide a GraphQL API.
- **C.** Push notifications alert a device, but they aren't a data API, and they don't deliver live updates inside an open app reliably or quickly enough.
- **D.** Letting mobile clients read a stream directly means giving them AWS credentials and building your own API, and Kinesis isn't a GraphQL service.

Resource: <https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html>
</details>

**43.** An e-commerce site places an "order confirmation" message in an SQS queue as soon as a customer checks out. The business wants the confirmation email sent 5 minutes later, so that customers who cancel within that window never receive it. Every message should wait the same 5 minutes, and the team wants the simplest built-in way to do this. What should they configure?
- A. A visibility timeout of 5 minutes on the queue
- B. Long polling with `WaitTimeSeconds` set to 300
- C. A dead-letter queue with a 5-minute redrive delay
- D. Delay queue settings with `DelaySeconds` set to 300

<details><summary>Answer</summary>

**D.** A delay queue hides every new message from consumers for the configured delay, up to 15 minutes, so each confirmation becomes visible only 5 minutes after it's sent.

Why not the others:
- **A.** The visibility timeout only starts after a consumer receives a message, so messages would still be picked up straight away.
- **B.** Long polling waits at most 20 seconds, and it only affects how long a receive call waits, not when messages become available.
- **C.** A dead-letter queue collects messages that repeatedly fail processing. It doesn't delay delivery.

Resource: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-delay-queues.html>
</details>

**44.** A brokerage publishes trade events that must reach three downstream systems (settlement, risk and reporting). Each system must receive every event for a given account exactly once and in the order it was published, and each processes events at its own pace through its own queue. What should they use?
- A. An SNS standard topic fanning out to three SQS standard queues
- B. An SNS FIFO topic fanning out to three SQS FIFO queues
- C. One SQS FIFO queue that all three systems read from
- D. EventBridge rules sending to three SQS standard queues

<details><summary>Answer</summary>

**B.** An SNS FIFO topic delivering to SQS FIFO queues keeps strict ordering within each message group (such as the account ID) and deduplicates messages, while giving each system its own queue to consume at its own pace.

Why not the others:
- **A.** Standard topics and queues deliver at least once, with best-effort ordering, so events can arrive twice or out of order.
- **C.** In a single queue, each message is consumed by only one reader, so each system would see only part of the events.
- **D.** Standard queues don't guarantee ordering or exactly-once processing, so events can arrive twice or out of order.

Resource: <https://docs.aws.amazon.com/sns/latest/dg/sns-fifo-topics.html>
</details>

**45.** An IoT platform runs a short workflow for every incoming device reading: validate it, enrich it with device metadata, and write it to a database. Each run takes under a second, there are about 50,000 runs per second at peak, and the steps are idempotent, so occasionally running one twice is harmless. Which orchestration option is the MOST cost-effective?
- A. AWS Step Functions Express workflows
- B. AWS Step Functions Standard workflows
- C. An EC2 fleet running a custom workflow engine
- D. Amazon MQ with a consumer for each workflow step

<details><summary>Answer</summary>

**A.** Express workflows are built for high-volume, short-lived event processing lasting up to 5 minutes, and they're billed by number of runs and duration. Their at-least-once execution model is fine because the steps are idempotent.

Why not the others:
- **B.** Standard workflows are billed for every state transition and are designed for long-running, exactly-once workflows, which makes them far more expensive at 50,000 runs per second.
- **C.** A custom workflow engine on EC2 means building, scaling and running the orchestration yourself.
- **D.** Chaining steps through a message broker means building the orchestration yourself and running brokers.

Resource: <https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html>
</details>

**46.** A survey service receives large bursts of form submissions whenever a marketing email goes out. Today an API Gateway HTTP API invokes a Lambda function that writes each submission straight to the database, and during bursts the database gets overwhelmed. The team wants to accept every submission instantly and process them at a steady rate, with as little code as possible in the request path. What should they do?
- A. Raise the Lambda function's timeout so slow writes can finish
- B. Add an ElastiCache cluster in front of the database for writes
- C. Integrate the API directly with SQS, and process the queue with Lambda
- D. Move the database to a larger instance class for the busy periods

<details><summary>Answer</summary>

**C.** API Gateway can send each request straight to an SQS queue with no code in the request path, so every submission is accepted immediately. A Lambda function then reads the queue at a controlled rate, protecting the database.

Why not the others:
- **A.** A longer timeout doesn't reduce the load. The database still gets every write at the same moment.
- **B.** A cache speeds up reads, not writes, and every submission still has to reach the database.
- **D.** A larger instance costs more all the time and can still be overwhelmed by a big enough burst, because nothing buffers the writes.

Resource: <https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-aws-services.html>
</details>

**47.** Whenever a customer's loyalty tier changes in a DynamoDB table, the company wants to send a congratulations email and update a separate analytics store, without changing the application that writes to the table and without polling the table for changes. What is the BEST approach?
- A. A scheduled Lambda function that scans the table every minute
- B. DynamoDB Streams on the table, triggering a Lambda function
- C. DynamoDB TTL on the tier attribute, triggering the email
- D. A DAX cluster that forwards every write to the email service

<details><summary>Answer</summary>

**B.** DynamoDB Streams records every item change, including the old and new values, and can trigger a Lambda function automatically, so downstream actions run without changing the writing application or polling the table.

Why not the others:
- **A.** Scanning the table every minute is polling: it's slow, consumes read capacity, and makes changes hard to detect reliably.
- **C.** TTL deletes items after they expire. It doesn't react to an attribute changing.
- **D.** DAX is a read cache for DynamoDB. It doesn't forward changes to other services.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html>
</details>

**48.** A Lambda function that processes uploaded files writes to a legacy on-premises database that can safely handle at most 20 concurrent connections. During a big upload burst, the function scaled to hundreds of concurrent executions and the database crashed. Other functions in the same account must keep their own ability to scale. What is the simplest fix?
- A. Provisioned concurrency of 20 on the function
- B. A longer timeout so each execution finishes its work
- C. A larger memory setting so fewer executions are needed
- D. Reserved concurrency of 20 on this function only

<details><summary>Answer</summary>

**D.** Reserved concurrency caps how many executions of one function can run at the same time, so the function never opens more than 20 connections. It also sets aside that capacity without limiting other functions.

Why not the others:
- **A.** Provisioned concurrency keeps environments initialized to reduce cold starts. It doesn't stop the function scaling beyond 20.
- **B.** A longer timeout doesn't limit how many executions run at the same time.
- **C.** More memory makes each execution faster, but it doesn't cap concurrency during a burst.

Resource: <https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html>
</details>

**49.** A subscription service needs to send each of its 2 million customers a renewal reminder exactly 30 days before that customer's own renewal date. Today a cron job on an EC2 instance scans the database every hour to find due reminders, and it's become slow and fragile. The team wants AWS to invoke a Lambda function at each customer's specific time, with no servers to manage. What should they use?
- A. SQS message timers set to 30 days before each renewal
- B. CloudWatch alarms, one for each customer's renewal date
- C. EventBridge Scheduler, one schedule for each reminder
- D. A Step Functions Express workflow that waits for each reminder

<details><summary>Answer</summary>

**C.** EventBridge Scheduler can create millions of one-time or recurring schedules, each invoking a target such as a Lambda function at a precise time, without running any servers.

Why not the others:
- **A.** SQS message timers can delay a message by at most 15 minutes, not 30 days.
- **B.** CloudWatch alarms watch metrics. They aren't a scheduling tool, and there are limits on how many an account can have.
- **D.** Express workflows run for at most 5 minutes, so they can't wait for a date weeks away.

Resource: <https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html>
</details>

**50.** An image-processing Lambda function is invoked asynchronously by S3 event notifications. When processing fails after its automatic retries, the team wants details of the failed event, including the error, sent to an SQS queue for investigation, without writing error-handling code inside the function. What should they configure?
- A. A Lambda on-failure destination that sends to SQS
- B. A longer function timeout so that fewer runs fail
- C. Provisioned concurrency on the image function
- D. S3 Replication of failed images to a second bucket

<details><summary>Answer</summary>

**A.** Lambda destinations send a record of each asynchronous invocation, including the request, response and error details, to a target such as an SQS queue when it succeeds or, as here, when it finally fails after retries.

Why not the others:
- **B.** A longer timeout might prevent some failures, but it doesn't capture the ones that still happen.
- **C.** Provisioned concurrency reduces cold starts. It doesn't handle failed invocations.
- **D.** Replication copies objects between buckets. It doesn't know which invocations failed or why.

Resource: <https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html>
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

Why not the others:
- **A.** A read replica in the same AZ fails along with the primary, and read replicas don't provide automatic failover.
- **C.** A larger instance class is still a single instance in one AZ.
- **D.** Restoring from a backup is slow and manual, and loses recent writes. It isn't automatic failover.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html>
</details>

**22.** A team debating their RDS architecture disagrees about what a read replica actually gives them versus what Multi-AZ gives them. What is the main purpose of an RDS read replica compared with Multi-AZ?
- A. Read replicas scale reads with asynchronous replication; Multi-AZ provides high availability
- B. Multi-AZ standbys serve reads in every database engine; read replicas exist only for backups
- C. Read replicas provide automatic failover by default; Multi-AZ is for scaling reads
- D. Both use synchronous replication, but only read replicas can be placed in another Region

<details><summary>Answer</summary>

**A.** Read replicas use asynchronous replication and are meant to offload read traffic; Multi-AZ maintains a synchronous standby purely for high availability and automatic failover. (A Multi-AZ DB cluster deployment, with two readable standbys, is the exception that can also serve reads.)

Why not the others:
- **B.** A standard Multi-AZ standby doesn't serve reads, and read replicas are for scaling reads, not backups.
- **C.** This is reversed: Multi-AZ provides automatic failover, and read replicas scale reads.
- **D.** Multi-AZ uses synchronous replication, but read replicas use asynchronous replication.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html>
</details>

**23.** A web application currently runs as two EC2 instances in the same Availability Zone behind an Application Load Balancer, and it must keep running even if that entire AZ fails. What is the minimum correct design change?
- A. A single instance with CloudWatch alarm-based automatic recovery
- B. An Auto Scaling group spanning at least two AZs behind an ALB
- C. Keep the two instances in the same AZ, but add a second Application Load Balancer as backup
- D. One large EC2 instance with an Elastic IP address attached

<details><summary>Answer</summary>

**B.** Spreading instances across at least two AZs in an Auto Scaling group means the loss of one AZ still leaves capacity running in another, which two instances in a single AZ can't provide no matter how many load balancers front them.

Why not the others:
- **A.** One instance is still a single point of failure in one AZ. Automatic recovery can't bring it back if that AZ is down.
- **C.** The instances are still in one AZ, so an AZ failure takes them all down. More load balancers don't help.
- **D.** One instance in one AZ still fails with that AZ. An Elastic IP doesn't add redundancy.

Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-availability-zone-balanced.html>
</details>

**24.** A company's internal reporting workload can tolerate being unavailable for a few hours and losing a few hours of data if its Region ever fails, and leadership has explicitly said the DR solution must be the cheapest option that still meets that RTO and RPO. Which DR strategy fits?
- A. Multi-site active/active
- B. Pilot light
- C. Backup and restore
- D. Warm standby

<details><summary>Answer</summary>

**C.** Ordered roughly by cost and by RTO/RPO: backup and restore (hours), pilot light (tens of minutes), warm standby (minutes), then multi-site active/active (near zero) — backup and restore is the cheapest option that still meets an hours-level target.

Why not the others:
- **A.** Active/active gives near-zero RTO and RPO at the highest cost, far more than an hours-level target needs.
- **B.** Pilot light keeps core systems running in the DR Region, which costs more than needed for an hours-level RTO.
- **D.** Warm standby runs a scaled-down copy of the whole stack, which costs more than needed for an hours-level RTO.

Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**25.** In a company's DR plan, the core databases stay continuously replicated to the DR Region around the clock, but the application servers there are kept switched off and are only launched from AMIs once a disaster is declared. Which strategy is this?
- A. Active/active
- B. Warm standby
- C. Pilot light
- D. Backup and restore

<details><summary>Answer</summary>

**C.** In pilot light, the critical data (like a database) is kept continuously up to date in the DR Region, while the compute layer sits idle until it's needed and is then quickly launched.

Why not the others:
- **A.** In active/active, both Regions run the full application and serve traffic at the same time.
- **B.** Warm standby keeps a scaled-down but running copy of the application servers, not switched-off ones.
- **D.** Backup and restore recovers data from backups. The databases aren't kept continuously replicated.

Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**26.** A global trading application needs a relational database where cross-Region replication typically lags by well under a second, and where, if the primary Region goes down, a secondary Region's cluster can be promoted to take over within minutes rather than hours. What fits?
- A. RDS Multi-AZ DB cluster
- B. RDS cross-Region snapshot copies, restored on demand
- C. DynamoDB global tables
- D. Amazon Aurora Global Database

<details><summary>Answer</summary>

**D.** Aurora Global Database typically replicates across Regions in under a second, and a secondary Region's cluster usually takes over as the primary within a few minutes, which snapshot copies or a single-Region Multi-AZ cluster can't match.

Why not the others:
- **A.** A Multi-AZ DB cluster stays within one Region, so it can't replicate across Regions.
- **B.** Snapshot copies are periodic, and restoring a large database takes time, so data loss and recovery time are both far larger.
- **C.** DynamoDB is a NoSQL database, not a relational one.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html>
</details>

**27.** A social app has active users on several continents and needs its NoSQL user-profile store to accept writes with low latency close to each user, with those writes visible from any Region shortly afterward. Which option fits?
- A. RDS read replicas in each Region
- B. Amazon ElastiCache in each Region, backed by a single database
- C. A single-Region DynamoDB table plus DAX for caching
- D. DynamoDB global tables

<details><summary>Answer</summary>

**D.** DynamoDB global tables replicate a table across chosen Regions and accept writes in any of them (multi-active), which is exactly what's needed for low-latency, multi-Region writes — a single-Region table, even with DAX, still funnels every write through one Region.

Why not the others:
- **A.** RDS is relational, not NoSQL, and read replicas can't accept writes.
- **B.** A cache doesn't durably store writes. Every write still goes to the one database in one Region.
- **C.** DAX speeds up reads, but every write still goes to the single Region hosting the table.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html>
</details>

**28.** A company's primary application endpoint is in `us-east-1`, with a fully provisioned but idle standby stack in `us-west-2`. Users should be sent to the standby automatically, without a manual DNS change, whenever the primary endpoint fails its health check. Which Route 53 routing policy should be used?
- A. Geolocation routing only
- B. Weighted routing with equal weights and no health checks
- C. Failover routing with health checks
- D. Simple routing with multiple IP addresses returned in random order

<details><summary>Answer</summary>

**C.** Failover routing designates a primary and a secondary record; Route 53 monitors the primary's health check and automatically starts answering with the secondary the moment the primary is unhealthy.

Why not the others:
- **A.** Geolocation routing picks records based on where users are, not on the primary endpoint's health.
- **B.** Equal weights send half the traffic to each Region all the time, and without health checks they keep sending traffic to a failed endpoint.
- **D.** Simple routing records aren't health-checked, so Route 53 keeps returning the failed endpoint's address.

Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html>
</details>

**29.** A video-streaming company runs identical stacks in three Regions and wants each viewer's DNS query answered with whichever Region will give that viewer the fastest connection, based on measured network conditions rather than the viewer's geographic location. Which Route 53 routing policy fits?
- A. Weighted routing
- B. Latency-based routing
- C. Geolocation routing
- D. Multivalue answer routing

<details><summary>Answer</summary>

**B.** Latency-based routing answers with the Region that gives the lowest measured network latency for that resolver, which is a better fit here than geolocation routing (based on the viewer's location, not measured latency).

Why not the others:
- **A.** Weighted routing splits traffic in fixed proportions you set, not by measured latency.
- **C.** Geolocation routing uses where the viewer is, not the measured network latency the question asks for.
- **D.** Multivalue answer routing returns several healthy records at random, not the fastest one.

Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html>
</details>

**30.** A multiplayer game with a TCP/UDP protocol needs static IP addresses that never change (so they can be safely allow-listed by corporate firewalls) and failover to a healthy Region in well under a minute if a Region degrades. What should it use?
- A. Amazon CloudFront
- B. Route 53 simple routing
- C. A Network Load Balancer in a single Region
- D. AWS Global Accelerator

<details><summary>Answer</summary>

**D.** Global Accelerator provides static anycast IP addresses that don't change, and it reroutes traffic to a healthy endpoint group within seconds of a health check failing — and it works for TCP/UDP, unlike CloudFront, which is HTTP(S)-focused.

Why not the others:
- **A.** CloudFront is built for HTTP(S) content delivery, not arbitrary TCP/UDP game protocols.
- **B.** Simple routing has no health checks, so it can't fail over, and DNS caching would slow any change anyway.
- **C.** A Network Load Balancer in one Region can't fail over to another Region.

Resource: <https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html>
</details>

**31.** A rendering farm of Linux EC2 instances spread across three Availability Zones all need to read and write the same shared project files concurrently, and the file system must keep working even if one of those AZs is lost. What should be used?
- A. An EBS volume with Multi-Attach
- B. Amazon EFS (Regional)
- C. Instance store on each instance
- D. Amazon EFS One Zone

<details><summary>Answer</summary>

**B.** Regional EFS is a shared, POSIX-compliant file system that can be mounted concurrently from instances in multiple AZs and stores data redundantly across AZs, unlike EFS One Zone, instance store, or EBS Multi-Attach (which is also limited to a single AZ).

Why not the others:
- **A.** EBS Multi-Attach only works with instances in the same AZ, and it needs a cluster-aware file system for concurrent writes.
- **C.** Instance store is local to each instance and not shared, and its data is lost when the instance stops.
- **D.** EFS One Zone stores data in a single AZ, so it doesn't survive the loss of that AZ.

Resource: <https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html>
</details>

**32.** Instances in an Auto Scaling group keep getting marked healthy by the default EC2 status checks even during an incident where the application itself is returning HTTP 500 errors on every request, so unhealthy instances never get replaced automatically. What fixes this?
- A. Move to a larger instance type to reduce the errors
- B. Add a scheduled action that replaces every instance nightly
- C. Turn off health checks entirely so instances aren't replaced mid-incident
- D. Turn on ELB health checks for the Auto Scaling group

<details><summary>Answer</summary>

**D.** EC2 status checks only detect infrastructure-level problems with the instance, not application-level failures. ELB health checks let the load balancer's health check (which can probe an actual application endpoint) drive instance replacement instead.

Why not the others:
- **A.** A larger instance type doesn't fix application errors or make them visible to health checks.
- **B.** Replacing instances nightly leaves unhealthy instances serving errors for hours in the meantime.
- **C.** Turning off health checks stops unhealthy instances from ever being replaced.

Resource: <https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html>
</details>

**33.** A company must keep a continuously updated copy of its S3 objects in a second Region for both compliance and disaster recovery, and wants 99.99% of new objects to be copied within 15 minutes of being written. What is required?
- A. S3 Cross-Region Replication with S3 Replication Time Control (RTC)
- B. S3 Transfer Acceleration, enabled on the source bucket
- C. A CloudFront distribution that uses the source bucket as its origin
- D. A lifecycle rule that transitions objects to the other Region after 30 days

<details><summary>Answer</summary>

**A.** Cross-Region Replication requires versioning on both the source and destination buckets, and Replication Time Control adds the 15-minute, 99.99% SLA the requirement calls for.

Why not the others:
- **B.** Transfer Acceleration speeds up long-distance uploads. It doesn't copy objects to another Region.
- **C.** CloudFront caches content at edge locations for delivery. It doesn't keep a durable copy in a second Region.
- **D.** Lifecycle rules change storage classes or expire objects. They can't move objects to another Region.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html>
</details>

**34.** A company wants to replicate its on-premises servers to AWS continuously at the block level for disaster recovery, targeting an RPO measured in seconds and an RTO measured in minutes, with the ability to fail back to on-premises once the incident is resolved. Which service should it use?
- A. AWS Elastic Disaster Recovery (AWS DRS)
- B. AWS Application Migration Service (MGN)
- C. AWS DataSync tasks scheduled every hour
- D. AWS Backup with an hourly backup plan

<details><summary>Answer</summary>

**A.** AWS DRS keeps servers continuously replicated for ongoing recovery readiness and supports failback. Application Migration Service uses similar underlying replication technology but is designed for one-time lift-and-shift migrations, not standing DR.

Why not the others:
- **B.** Application Migration Service is built for one-time migrations. It isn't meant for ongoing DR with failback.
- **C.** DataSync copies files and objects, not whole servers at the block level, and an hourly schedule means an RPO of up to an hour.
- **D.** Hourly backups mean an RPO of up to an hour, and restoring servers takes much longer than minutes.

Resource: <https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html>
</details>

**35.** A VPC has instances in three Availability Zones, but only one NAT gateway, deployed in AZ-a's public subnet. During a maintenance event, AZ-a becomes unavailable. What happens to instances in the other AZs, and how should this be fixed going forward?
- A. Nothing; outbound traffic switches to the internet gateway automatically until AZ-a recovers
- B. Instances in the other AZs lose internet access; the fix is one NAT gateway per AZ
- C. Nothing; a NAT gateway created in one AZ fails over to other AZs automatically
- D. Instances in the other AZs lose internet access; the fix is to add a second NAT gateway in AZ-a

<details><summary>Answer</summary>

**B.** A standard (zonal) NAT gateway lives entirely in one AZ, so instances in other AZs that route through it lose outbound connectivity if that AZ is impaired. The standard fix is one NAT gateway per AZ, with each AZ's private subnets routing to the NAT gateway in the same AZ. (A regional NAT gateway is a newer alternative that spans AZs automatically.)

Why not the others:
- **A.** Instances in private subnets have no public IPs or route to the internet gateway, so nothing switches over automatically.
- **C.** A standard NAT gateway is zonal and doesn't fail over to other AZs.
- **D.** A second NAT gateway in AZ-a fails along with AZ-a, so the other AZs still lose access.

Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>
</details>

**36.** A company connects its on-premises data center to AWS through a single AWS Direct Connect link at one location, and a recent fiber cut at that location caused a multi-hour outage. Leadership wants this made highly available, but has capped the budget and explicitly ruled out a second physical Direct Connect circuit for now. What should be added?
- A. A NAT gateway in each Availability Zone
- B. A VPC peering connection to a second VPC in another Region
- C. AWS Transit Gateway with a second attachment in the same Region
- D. A backup AWS Site-to-Site VPN connection

<details><summary>Answer</summary>

**D.** The most resilient option is a second Direct Connect connection at a separate location, but since that's ruled out, a Site-to-Site VPN as a backup path is the standard lower-cost way to add resiliency to a single DX link.

Why not the others:
- **A.** NAT gateways give private subnets outbound internet access. They don't provide a second path from the data center.
- **B.** VPC peering connects two VPCs. It doesn't provide a backup path from the on-premises network.
- **C.** Another attachment inside AWS doesn't add a second path from the data center. The single Direct Connect link is still a single point of failure.

Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html>
</details>

**37.** During an incident review, an engineer claims that Aurora Replicas are the reason the database "healed itself" after two storage nodes failed. A colleague points out that's not quite right. Which Aurora feature actually keeps six copies of data across three AZs and repairs itself automatically, independent of how many read replicas exist?
- A. Aurora Backtrack with a 72-hour window
- B. Aurora Serverless v2 capacity scaling
- C. The Aurora cluster storage volume
- D. Aurora Auto Scaling for Aurora Replicas

<details><summary>Answer</summary>

**C.** The Aurora cluster storage volume itself maintains six copies across three AZs and self-heals, tolerating the loss of up to two copies for writes and three for reads — this is separate from Aurora Replicas, Backtrack, or Serverless scaling.

Why not the others:
- **A.** Backtrack rewinds the database to an earlier point in time. It has nothing to do with how storage is replicated.
- **B.** Serverless v2 scales compute capacity. It doesn't store or repair data copies.
- **D.** Replica Auto Scaling adds or removes read replicas for read load. Storage durability doesn't depend on it.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html>
</details>

**38.** Before their next major release, a team wants to deliberately and safely simulate an Availability Zone failure and random instance terminations against their production-like environment, to see how the workload actually behaves — not just review dashboards after the fact. Which service should they use?
- A. Amazon Inspector network reachability findings
- B. AWS Trusted Advisor fault tolerance checks
- C. AWS X-Ray service maps and traces
- D. AWS Fault Injection Service (FIS)

<details><summary>Answer</summary>

**D.** AWS FIS runs controlled chaos-engineering experiments, such as simulating AZ impairment or terminating instances, so teams can observe real behavior under failure conditions rather than just reviewing static findings or traces.

Why not the others:
- **A.** Inspector's reachability findings analyze network configuration. They don't simulate failures.
- **B.** Trusted Advisor's fault tolerance checks flag configuration risks. They don't inject failures.
- **C.** X-Ray traces requests so you can observe behavior. It doesn't simulate failures.

Resource: <https://docs.aws.amazon.com/fis/latest/userguide/what-is.html>
</details>

**39.** A support team accidentally ran a script that overwrote thousands of items in a DynamoDB table at 2:17 PM, and needs to restore the table to exactly how it looked one minute before that happened. The table must generally be recoverable to any second within the last 35 days. What should be enabled?
- A. DynamoDB Streams processed into S3 by Lambda
- B. Time to Live (TTL) on each item
- C. Point-in-time recovery (PITR)
- D. Daily on-demand backups started by EventBridge

<details><summary>Answer</summary>

**C.** PITR continuously backs up the table and can restore it to any second within the retention window (1–35 days, 35 by default) — precise enough to restore to 2:16 PM, which daily snapshots can't do.

Why not the others:
- **A.** Streams keep item changes for only 24 hours, and you'd have to build the restore logic yourself.
- **B.** TTL deletes items after they expire. It doesn't back anything up.
- **D.** Daily backups can only restore to the moment each backup was taken, not to 2:16 PM.

Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Point-in-time-recovery.html>
</details>

**40.** After splitting a monolith into a dozen microservices, operations can no longer tell which specific service is responsible for the latency spikes and intermittent errors customers are reporting, since each request now hops through several services before returning a response. Which service helps pinpoint that?
- A. AWS X-Ray
- B. VPC Flow Logs
- C. AWS Config
- D. AWS CloudTrail

<details><summary>Answer</summary>

**A.** X-Ray traces a request end-to-end across services and builds a service map showing where time is spent and where errors occur, which VPC Flow Logs, Config, and CloudTrail aren't designed to do.

Why not the others:
- **B.** VPC Flow Logs record IP traffic metadata. They can't show how long each service took to handle a request.
- **C.** AWS Config records resource configuration changes, not request latency or errors.
- **D.** CloudTrail records calls to AWS APIs, not requests flowing between your own services.

Resource: <https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html>
</details>

**51.** A bank runs identical stacks of its payment application in two Regions. During a Regional impairment, the operations team wants to move all traffic to the healthy Region with a simple, reliable switch that they control manually, and that doesn't depend on the impaired Region's control plane or on a complex DNS change made under pressure. What should they use?
- A. Route 53 weighted routing, with weights edited by hand
- B. CloudFront with the healthy Region as the only origin
- C. An Auto Scaling policy that scales the impaired Region to zero
- D. Amazon Application Recovery Controller (ARC) routing controls

<details><summary>Answer</summary>

**D.** ARC routing controls are on/off switches, backed by a highly available data plane spread across five Regions, that shift traffic between Regional replicas through Route 53 health checks. Safety rules help prevent mistakes such as turning off every Region.

Why not the others:
- **A.** Editing record weights relies on Route 53's control plane during an incident and is easy to get wrong under pressure.
- **B.** Reconfiguring CloudFront origins is a configuration change that takes time to deploy, and it isn't a purpose-built failover switch.
- **C.** Scaling down the impaired Region's capacity doesn't redirect users, and it depends on that Region's control plane.

Resource: <https://docs.aws.amazon.com/r53recovery/latest/dg/routing-control.html>
</details>

**52.** Leadership has set an RTO of 1 hour and an RPO of 15 minutes for a customer-facing application made up of EC2, RDS, DynamoDB and S3. The architects want a service that assesses the application's current architecture against those targets, estimates whether they'd be met in different disruption scenarios, and recommends improvements, without running a manual review. What should they use?
- A. AWS Trusted Advisor fault tolerance checks
- B. AWS Resilience Hub resiliency assessments
- C. AWS Fault Injection Service experiments
- D. Amazon CloudWatch Synthetics canaries

<details><summary>Answer</summary>

**B.** Resilience Hub assesses an application's resources against a resiliency policy that sets RTO and RPO targets, estimates whether they're met for disruptions such as AZ or Region failure, and recommends improvements.

Why not the others:
- **A.** Trusted Advisor flags individual configuration risks. It doesn't assess a whole application against RTO and RPO targets.
- **C.** FIS injects real failures to test behavior. It doesn't assess an architecture against targets or recommend changes.
- **D.** Synthetics canaries monitor endpoints by running scripted checks. They don't assess recovery objectives.

Resource: <https://docs.aws.amazon.com/resilience-hub/latest/userguide/what-is.html>
</details>

**53.** A media company keeps copies of its video library in S3 buckets in three Regions, kept in sync with replication. Applications around the world should use one global endpoint that routes each request to the closest bucket, and if one Region becomes unavailable, requests should automatically go to another bucket without changing application code. What should they use?
- A. S3 Transfer Acceleration on each of the three buckets
- B. A Route 53 latency record for each bucket's website endpoint
- C. An S3 Multi-Region Access Point in front of the buckets
- D. A lifecycle rule that copies objects to the closest Region

<details><summary>Answer</summary>

**C.** A Multi-Region Access Point gives one global endpoint for buckets in several Regions. It routes requests over the AWS network to the lowest-latency bucket and can fail over to another Region's bucket.

Why not the others:
- **A.** Transfer Acceleration speeds up transfers to one bucket. It doesn't route requests across buckets or fail over.
- **B.** Website endpoints only serve public, unauthenticated reads over HTTP, so applications couldn't use them for authenticated S3 API calls.
- **D.** Lifecycle rules change storage classes or expire objects. They can't copy objects between Regions or route requests.

Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiRegionAccessPoints.html>
</details>

**54.** A news site serves images through CloudFront from an S3 bucket in `us-east-1`, with a replicated copy in `us-west-2`. During a recent S3 disruption in `us-east-1`, image requests failed until an engineer changed the distribution's origin by hand. The team wants CloudFront to retry the second bucket automatically when the primary returns errors. What should they configure?
- A. A CloudFront origin group with origin failover
- B. A longer CloudFront cache TTL for all the images
- C. S3 Transfer Acceleration on the primary bucket
- D. A Route 53 failover record in front of CloudFront

<details><summary>Answer</summary>

**A.** An origin group has a primary and a secondary origin. When the primary returns specified HTTP error codes or times out, CloudFront automatically retries the request against the secondary origin.

Why not the others:
- **B.** Longer caching helps with images already in the cache, but requests for anything not cached would still fail.
- **C.** Transfer Acceleration speeds up transfers to one bucket. It doesn't provide a second origin to fail over to.
- **D.** CloudFront itself is still up, so DNS failover in front of it wouldn't help. The failure is at the origin behind it.

Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html>
</details>

**55.** A publishing platform stores article drafts on an Amazon EFS file system in `eu-west-1`. For disaster recovery, the company needs a continuously updated copy of the file system in `eu-central-1` with an RPO of about 15 minutes, and wants AWS to manage the copying rather than running its own sync scripts. What should they use?
- A. An hourly AWS Backup plan with a copy to `eu-central-1`
- B. A cron job that runs rsync between the two Regions
- C. EFS lifecycle management to the Archive storage class
- D. EFS replication to a file system in `eu-central-1`

<details><summary>Answer</summary>

**D.** EFS replication keeps a read-only copy of a file system in another Region (or the same Region) up to date automatically. After the initial copy, it maintains an RPO of 15 minutes for most file systems.

Why not the others:
- **A.** Hourly backups give an RPO of up to an hour, and restoring a backup takes longer than failing over to a replica.
- **B.** Custom rsync scripts are exactly the self-managed copying the company wants to avoid, and they're hard to monitor.
- **C.** Lifecycle management moves rarely used files to cheaper storage in the same file system. It doesn't create a copy in another Region.

Resource: <https://docs.aws.amazon.com/efs/latest/ug/efs-replication.html>
</details>

**56.** In a company's DR design, a scaled-down but fully functional copy of the whole application runs in the recovery Region at all times: its web and app servers handle a trickle of test traffic, and its database is continuously replicated. In a disaster, the team scales that environment up to full production size and redirects users. Which DR strategy is this?
- A. Pilot light
- B. Warm standby
- C. Backup and restore
- D. Multi-site active/active

<details><summary>Answer</summary>

**B.** Warm standby keeps a scaled-down but fully working copy of the production environment running in the recovery Region, so recovery means scaling it up. That gives an RTO measured in minutes.

Why not the others:
- **A.** In pilot light, only the core data layer is running. The application servers are switched off until a disaster.
- **C.** Backup and restore has no running environment in the recovery Region. Everything is rebuilt from backups.
- **D.** In active/active, both Regions serve full production traffic all the time, rather than one waiting at reduced size.

Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**57.** A global payments processor has decided that any Regional outage must cause essentially no downtime and no lost transactions. Budget is not the constraint: it can run full production capacity in several Regions at once, with every Region serving live customer traffic all the time. Which DR strategy matches this?
- A. Pilot light
- B. Warm standby
- C. Active/active
- D. Backup and restore

<details><summary>Answer</summary>

**C.** Multi-site active/active (active/active) runs the full workload in multiple Regions, all serving traffic, so losing a Region means only redirecting its users. It gives the lowest RTO and RPO, near zero, at the highest cost.

Why not the others:
- **A.** Pilot light keeps only the data layer running, so recovery means starting servers, which takes tens of minutes.
- **B.** Warm standby runs a scaled-down copy that must be scaled up during a disaster, so there's still some downtime.
- **D.** Backup and restore means rebuilding from backups, with an RTO and RPO measured in hours.

Resource: <https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html>
</details>

**58.** An Aurora MySQL cluster has a writer instance and two Aurora Replicas in other Availability Zones. The application connects using the cluster endpoint. If the writer instance fails, what happens?
- A. Aurora promotes a replica to writer, and the cluster endpoint then points to it
- B. The cluster stays read-only until an administrator restores it from a snapshot
- C. The application must be reconfigured to connect to a replica's instance endpoint
- D. Aurora launches a new writer in the same AZ and copies the data from a backup

<details><summary>Answer</summary>

**A.** When the writer fails, Aurora automatically promotes one of the Aurora Replicas, based on its priority tier, to be the new writer. The cluster endpoint always points to the current writer, so the application reconnects without configuration changes.

Why not the others:
- **B.** Aurora fails over automatically. Restoring from a snapshot would be slow and lose recent data.
- **C.** The cluster endpoint follows the new writer automatically, so no reconfiguration is needed.
- **D.** With replicas available, Aurora promotes one of them. Data lives in the shared cluster volume, so nothing is copied from a backup.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html>
</details>

**59.** A regulated company runs Amazon RDS for PostgreSQL in `us-east-1` with automated backups and a 14-day retention period. An auditor now requires that the company can restore the database to a point in time in a second Region if `us-east-1` becomes unavailable, with the lowest operational effort. What should they enable?
- A. Multi-AZ deployment in `us-east-1`
- B. A read replica in the same Region
- C. Manual snapshots copied once a week
- D. Cross-Region automated backups

<details><summary>Answer</summary>

**D.** RDS can replicate automated backups (snapshots and transaction logs) to another Region, so the database can be restored to a point in time there, without scripts to copy snapshots.

Why not the others:
- **A.** Multi-AZ protects against an AZ failure within `us-east-1`, not the loss of the whole Region.
- **B.** A replica in the same Region is lost along with that Region.
- **C.** Weekly copies don't allow point-in-time restore, lose up to a week of data, and need ongoing manual effort.

Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReplicateBackups.html>
</details>

**60.** A small API runs on six EC2 instances with public IP addresses, without a load balancer, to keep costs down. The team wants DNS queries for the API to return several healthy instance IP addresses, so clients can try another address if one fails, and wants unhealthy instances left out of the answers automatically. Which Route 53 routing policy fits?
- A. Simple routing with all six IP addresses in one record
- B. Multivalue answer routing with health checks
- C. Geolocation routing with one record per country
- D. Failover routing with a primary and a secondary

<details><summary>Answer</summary>

**B.** Multivalue answer routing returns up to eight healthy records for each query, chosen at random, and leaves out any record whose health check fails. It isn't a substitute for a load balancer, but it adds some availability at low cost.

Why not the others:
- **A.** Simple routing can return several addresses, but they aren't health-checked, so failed instances stay in the answers.
- **C.** Geolocation routing picks records by the user's location. It doesn't return several healthy addresses.
- **D.** Failover routing sends traffic to one primary target and a single backup, not several healthy addresses.

Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-multivalue.html>
</details>
