# Domain 3: Design High-Performing Architectures (24%)

Guide page: <https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain3.html>

---

## Task 3.1: Determine high-performing and/or scalable storage solutions

**1.** A trading platform's order-matching database runs on a single EC2 instance and needs 150,000 IOPS with consistently sub-millisecond latency on one volume. The team already uses gp3 volumes elsewhere in the account for general-purpose workloads, but gp3's per-volume ceiling isn't enough here. Which EBS volume type fits?
- A. gp2 (General Purpose SSD) at 16 TiB
- B. gp3 (General Purpose SSD) at maximum IOPS
- C. st1 (Throughput Optimized HDD)
- D. io2 Block Express (Provisioned IOPS SSD)

<details><summary>Answer</summary>

**D.** io2 Block Express supports up to 256,000 IOPS with sub-millisecond latency. gp3 tops out at 80,000 IOPS per volume, and HDD volumes are built for throughput, not IOPS.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html>
</details>

**2.** A team currently pays for io1 volumes sized well beyond their storage needs, purely to get enough provisioned IOPS, and wants a volume type that lets it provision IOPS and throughput independently of capacity, at a lower baseline cost than gp2. Which EBS volume type fits?
- A. io1
- B. gp3
- C. Magnetic (standard)
- D. st1

<details><summary>Answer</summary>

**B.** gp3 has a baseline of 3,000 IOPS and 125 MiB/s, and both can be raised independently of the volume's size, unlike io1, which ties cost to a larger provisioned volume.
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html>
</details>

**3.** A nightly big-data job reads large log files sequentially from start to finish and needs high throughput at the lowest cost per GB. The instance's root (boot) volume is a separate gp3 volume, so this volume only needs to hold the data being processed. Which EBS type fits?
- A. gp3 (General Purpose SSD)
- B. io2 (Provisioned IOPS SSD)
- C. sc1 (Cold HDD), used as the boot volume
- D. st1 (Throughput Optimized HDD)

<details><summary>Answer</summary>

**D.** st1 is built for high-throughput, sequential workloads at low cost. (HDD volumes like st1 and sc1 can't be used as boot volumes anyway, which rules out option C on its own.)
Resource: <https://docs.aws.amazon.com/ebs/latest/userguide/hdd-vols.html>
</details>

**4.** A genomics pipeline needs extremely high random I/O scratch space for intermediate files. Losing this particular data if the instance stops is acceptable, since final results are written back to S3 as a separate step. Which option is BEST?
- A. EC2 instance store (NVMe)
- B. Amazon EFS in Max I/O mode
- C. Amazon S3 Express One Zone
- D. An io2 EBS volume

<details><summary>Answer</summary>

**A.** Instance store is ephemeral, physically attached NVMe storage with very high random I/O performance — a good fit when the data doesn't need to survive a stop or terminate.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html>
</details>

**5.** The same genomics team also runs an HPC cluster that needs a parallel file system delivering hundreds of GB/s of aggregate throughput, and it must stay linked to a multi-petabyte S3 data lake so results flow back automatically when jobs finish. What should be used?
- A. S3 Glacier Instant Retrieval, mounted with Mountpoint
- B. Amazon FSx for Windows File Server with SSD storage
- C. Amazon EFS with Elastic Throughput and Max I/O mode
- D. Amazon FSx for Lustre, linked to an S3 data repository

<details><summary>Answer</summary>

**D.** FSx for Lustre is a parallel file system designed for HPC-scale throughput and integrates directly with an S3 bucket as its data repository.
Resource: <https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html>
</details>

**6.** After migrating file shares from an on-premises Windows Server, an engineering team needs a shared SMB file system that integrates with their existing Active Directory domain and supports DFS namespaces, without standing up and patching their own Windows file servers on EC2. What should be used?
- A. Amazon FSx for Windows File Server
- B. Amazon FSx for Lustre
- C. Amazon EFS with Elastic Throughput
- D. An S3 bucket mounted through s3fs

<details><summary>Answer</summary>

**A.** FSx for Windows File Server provides a native SMB file system with AD integration and DFS support. EFS supports NFS only, for Linux clients.
Resource: <https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html>
</details>

**7.** A storage team is lifting and shifting NetApp ONTAP workloads that rely on NFS, SMB, and iSCSI access to the same volumes, plus SnapMirror replication, and wants to keep using those exact capabilities in AWS rather than redesign around a different storage model. What fits?
- A. Amazon FSx for NetApp ONTAP
- B. Amazon EFS with cross-Region replication
- C. Amazon FSx for OpenZFS
- D. AWS Storage Gateway Tape Gateway

<details><summary>Answer</summary>

**A.** FSx for NetApp ONTAP provides multi-protocol (NFS, SMB, iSCSI) access and supports ONTAP features like SnapMirror, which the other options don't replicate.
Resource: <https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/what-is-fsx-ontap.html>
</details>

**8. (Select TWO.)** A design agency has studios on four continents, and every studio uploads multi-gigabyte video project files to one S3 bucket in `us-east-1`. Uploads from the Tokyo and Sydney studios are especially slow, and large files occasionally fail partway through over flaky hotel-grade Wi-Fi when someone uploads from the road. Which TWO features would improve this?
- A. S3 Glacier Deep Archive
- B. Multipart upload
- C. Requester Pays
- D. S3 Transfer Acceleration
- E. S3 Object Lock

<details><summary>Answer</summary>

**B, D.** Multipart upload is recommended for objects over 100 MB (and required over 5 GB) and lets a failed part be retried without restarting the whole file. Transfer Acceleration routes uploads through the nearest CloudFront edge location and over the AWS backbone, which especially helps the far-away studios.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html>
</details>

**9.** A content platform's single S3 bucket starts hitting request-rate limits during peak hours, even though the team had assumed S3 throughput was effectively unlimited for a single bucket. How can the application get well beyond 5,500 GET requests per second against this bucket?
- A. Move the objects to S3 One Zone-IA, which has higher request limits
- B. Nothing; S3 is limited to 5,500 GET requests per second per bucket
- C. Spread objects across multiple prefixes, since request-rate limits apply per prefix
- D. Enable versioning so that reads are spread across object versions

<details><summary>Answer</summary>

**C.** Each prefix supports 5,500 GET/HEAD and 3,500 PUT/POST/DELETE requests per second, and there's no limit on the number of prefixes, so spreading objects across more prefixes raises the effective ceiling.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html>
</details>

**10.** An ML training job needs single-digit-millisecond access to a very hot subset of training data that's re-read constantly within one AZ, and the team wants the highest possible S3 request rates for that subset. The bulk of the company's older, rarely accessed training data already lives in S3 Standard-IA and doesn't need to move. Which storage class fits the hot subset?
- A. S3 Glacier Instant Retrieval
- B. S3 Intelligent-Tiering
- C. S3 Express One Zone
- D. S3 Standard-IA

<details><summary>Answer</summary>

**C.** S3 Express One Zone uses directory buckets co-located with compute in a single AZ, giving single-digit-millisecond access and the highest request rates of the S3 storage classes.
Resource: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-bucket-high-performance.html>
</details>

**11.** A media company's on-premises editing workstations need low-latency local access to frequently used project files, but the company wants the authoritative copy of everything durably stored in S3 as objects, not as a block-volume image. What should be used?
- A. AWS Transfer Family SFTP server
- B. AWS DataSync with an on-premises agent
- C. Volume Gateway stored mode backed by EBS
- D. AWS Storage Gateway, S3 File Gateway

<details><summary>Answer</summary>

**D.** S3 File Gateway caches frequently used files locally for low-latency access while storing the data durably in S3 as native objects.
Resource: <https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html>
</details>

---

## Task 3.2: Design high-performing and elastic compute solutions

**12.** A weather-simulation HPC cluster running MPI jobs needs the lowest possible network latency and the highest packets-per-second between its nodes, and the team accepts that every node must sit in a single AZ to get it. Which placement group should be used?
- A. Cluster placement group
- B. Partition placement group
- C. Spread placement group
- D. No placement group

<details><summary>Answer</summary>

**A.** A cluster placement group packs instances close together in a single AZ for the lowest latency and highest network throughput. Add Elastic Fabric Adapter (EFA) for MPI workloads.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**13.** A company runs a small number of critical license servers and wants each one placed on distinct underlying hardware, to reduce the chance that a single hardware failure takes down more than one of them. Unlike the HPC cluster above, low inter-instance latency isn't a concern here. Which placement group fits?
- A. Spread placement group
- B. Cluster placement group
- C. Partition placement group
- D. Dedicated Host

<details><summary>Answer</summary>

**A.** A spread placement group places each instance on distinct underlying hardware (up to 7 running instances per AZ), which is exactly the isolation this scenario needs.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**14.** A large self-managed Cassandra cluster needs rack-aware placement, where each partition of instances is isolated from the underlying hardware of the other partitions, to limit the blast radius of a single rack failure. Which placement group should be used?
- A. Cluster placement group
- B. No placement group
- C. Spread placement group
- D. Partition placement group

<details><summary>Answer</summary>

**D.** Partition placement groups divide instances into logical partitions that don't share underlying hardware, which is the standard fit for rack-aware distributed systems like Cassandra, Hadoop, and Kafka.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html>
</details>

**15.** An in-memory analytics engine loads a large dataset entirely into RAM and needs an EC2 instance family with a very high memory-to-vCPU ratio, rather than one optimized for raw compute or local NVMe storage. Which instance family should be chosen?
- A. Burstable (T)
- B. Compute optimized (C)
- C. Memory optimized (R, X)
- D. Storage optimized (I, D)

<details><summary>Answer</summary>

**C.** Memory optimized instance families (like R and X) are built for the highest memory-to-vCPU ratio, which fits a workload dominated by RAM usage rather than CPU or local disk throughput.
Resource: <https://aws.amazon.com/ec2/instance-types/>
</details>

**16.** A CPU-bound Lambda function that resizes images runs noticeably slower than expected, and the developer assumes they need to directly configure the number of vCPUs, the way they would for an EC2 instance. How is more CPU actually allocated to a Lambda function?
- A. Set the number of vCPUs in the function's configuration
- B. Increase the memory setting, because CPU scales in proportion to memory
- C. Enable provisioned concurrency so more CPU is reserved
- D. Increase the function timeout so it has more time to run

<details><summary>Answer</summary>

**B.** Lambda has no direct vCPU setting — CPU power scales in proportion to the configured memory, up to 10,240 MB, which gives up to 6 vCPUs.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html>
</details>

**17.** A latency-sensitive Lambda-backed API shows noticeably higher response times right after each deployment and during the first requests of a business day — consistent with cold starts — even though the function's reserved concurrency is already set high enough to handle peak traffic. What reduces cold starts?
- A. Reserved concurrency set to the peak number of requests
- B. A longer timeout on the function and on the API integration
- C. Provisioned concurrency (or SnapStart for supported runtimes)
- D. A dead-letter queue that catches failed invocations

<details><summary>Answer</summary>

**C.** Reserved concurrency only limits or guarantees the number of concurrent executions; it doesn't pre-initialize execution environments. Provisioned concurrency (or SnapStart) keeps environments warm and ready, which is what actually cuts cold starts.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html>
</details>

**18.** A video-encoding batch job takes about 3 hours to process a single large file, and a developer proposes running each job as one Lambda invocation to avoid managing servers. Why is Lambda NOT suitable here?
- A. Lambda functions can't read from or write to S3
- B. Lambda doesn't support the runtime the job is written in
- C. Lambda functions can't use IAM execution roles
- D. The maximum Lambda timeout is 15 minutes

<details><summary>Answer</summary>

**D.** A single Lambda invocation can run for at most 15 minutes, far less than the 3 hours this job needs. AWS Batch, ECS/Fargate tasks, or EC2 instances are better fits for long-running batch jobs.
Resource: <https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html>
</details>

**19.** A genomics company needs to run thousands of containerized batch jobs with job dependencies and priority queues, and wants AWS to automatically provision the most cost-effective mix of compute — including Spot Instances — without the team managing a compute cluster by hand. What should it use?
- A. EC2 Image Builder
- B. AWS Step Functions alone
- C. AWS Batch
- D. Amazon Lightsail

<details><summary>Answer</summary>

**C.** AWS Batch manages job queues, dependencies, and priorities, and automatically provisions the optimal quantity and type of compute resources, including Spot, based on the jobs submitted.
Resource: <https://docs.aws.amazon.com/batch/latest/userguide/what-is-batch.html>
</details>

**20.** A three-person team wants to deploy a web application by simply uploading their code and have AWS handle capacity provisioning, load balancing, and scaling — while still being able to log into or tweak the underlying EC2 instances if something goes wrong. What should it use?
- A. Amazon EC2, configured manually
- B. AWS CloudFormation only
- C. AWS Elastic Beanstalk
- D. AWS Outposts

<details><summary>Answer</summary>

**C.** Elastic Beanstalk provisions and manages the underlying EC2 instances, load balancer, and Auto Scaling group for you from an application code upload, while still giving access to the underlying resources if needed.
Resource: <https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html>
</details>

**21.** An ALB currently sends all traffic to one target group, but the team is splitting the monolith so requests to `/api/*` go to a new microservice's target group while `/images/*` continues to the existing image-serving target group. Which ALB feature accomplishes this?
- A. Sticky sessions on each target group
- B. Cross-zone load balancing
- C. Path-based routing in listener rules
- D. Connection draining (deregistration delay)

<details><summary>Answer</summary>

**C.** ALB listener rules can route based on the URL path (and also support host-based, header-based, and query-string routing), which is exactly what's needed to split traffic between the two target groups.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html>
</details>

**22.** A financial exchange's matching engine needs a load balancer capable of handling millions of requests per second, with a static IP address per AZ, for a mix of TCP and UDP traffic, and it can't tolerate the extra latency of Layer 7 processing. Which should be used?
- A. Application Load Balancer
- B. Classic Load Balancer
- C. Gateway Load Balancer
- D. Network Load Balancer

<details><summary>Answer</summary>

**D.** Network Load Balancer operates at Layer 4, handles millions of requests per second, and offers a static IP per AZ, which fits both the throughput and the TCP/UDP requirement.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html>
</details>

**23.** A security team wants all traffic entering the VPC to pass transparently through a fleet of third-party virtual firewall appliances for inspection, without the appliances terminating the original connection or the load balancer rewriting the packets' source and destination. Which load balancer should be used?
- A. Application Load Balancer
- B. Network Load Balancer
- C. Gateway Load Balancer
- D. Classic Load Balancer

<details><summary>Answer</summary>

**C.** Gateway Load Balancer uses GENEVE encapsulation to pass traffic transparently to third-party virtual appliances for inspection, then back out, which the other load balancer types aren't designed for.
Resource: <https://docs.aws.amazon.com/elasticloadbalancing/latest/gateway/introduction.html>
</details>

**24.** After a cost review turned up several oversized EC2 instances and over-provisioned Lambda functions, a company wants ongoing, usage-based recommendations for right-sizing EC2 instances, EBS volumes, and Lambda memory settings, rather than a one-time manual audit. Which service provides them?
- A. AWS Config
- B. Amazon Inspector
- C. AWS Cost Explorer forecasts
- D. AWS Compute Optimizer

<details><summary>Answer</summary>

**D.** AWS Compute Optimizer analyzes utilization metrics over time and produces right-sizing recommendations for EC2, EBS, Lambda, and other resources, refreshed as usage patterns change.
Resource: <https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html>
</details>

---

## Task 3.3: Determine high-performing database solutions

**25.** A mobile game's DynamoDB-backed leaderboard is read far more often than it's written, and the product team wants microsecond read latency for the most heavily requested items during tournament weekends, without re-architecting the data model. What should be added?
- A. Global tables
- B. DynamoDB Accelerator (DAX)
- C. ElastiCache Memcached as a write-through cache managed by AWS
- D. DynamoDB Streams

<details><summary>Answer</summary>

**B.** DAX is an in-memory cache built specifically in front of DynamoDB, giving microsecond read latency for cached items without any application-side cache-management code.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html>
</details>

**26.** A finance team's month-end reporting queries against the primary Aurora writer are slowing down transaction processing for the rest of the business. The DBA doesn't want to resize the writer's instance class, since that would also raise costs for the always-on write workload. What is the BEST way to offload the reporting reads?
- A. Increase the writer instance to a larger instance class
- B. Use Backtrack to rewind the database after each report
- C. Add Aurora Replicas and point reports at the reader endpoint
- D. Run the reports from a Lambda function against the writer

<details><summary>Answer</summary>

**C.** Aurora Replicas share the same underlying storage as the writer but serve reads independently, and the reader endpoint automatically load-balances across them, taking the reporting load off the writer entirely.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html>
</details>

**27.** A SaaS company's database workload is unpredictable — some customer accounts are nearly idle while others generate sudden bursts of activity — and the team wants capacity to scale automatically in fine-grained increments rather than jumping between a small number of fixed instance sizes. Which option fits?
- A. RDS on a fixed large instance
- B. Redshift provisioned
- C. Aurora Serverless v2
- D. RDS Custom

<details><summary>Answer</summary>

**C.** Aurora Serverless v2 scales database capacity up and down automatically in fine-grained increments based on load, which fits unpredictable, spiky per-customer usage far better than a fixed instance size.
Resource: <https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html>
</details>

**28.** A retailer wants to run complex SQL joins and aggregations across years of sales history — well into petabyte scale — for its BI team, a workload that's become a poor fit for the row-oriented OLTP database the application currently uses. What should be used?
- A. Amazon Redshift
- B. Amazon Neptune
- C. DynamoDB
- D. Amazon RDS for PostgreSQL

<details><summary>Answer</summary>

**A.** Redshift is a columnar, petabyte-scale data warehouse purpose-built for complex analytical SQL over large historical datasets, unlike a row-oriented OLTP database.
Resource: <https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html>
</details>

**29.** A social network wants to efficiently query highly connected relationships — for example, "friends of friends who also follow the same three pages" — a query pattern that has become slow and awkward to express as joins in the team's current relational schema. Which database fits?
- A. Amazon Keyspaces
- B. Amazon DocumentDB
- C. Amazon Timestream
- D. Amazon Neptune

<details><summary>Answer</summary>

**D.** Neptune is a purpose-built graph database designed for exactly this kind of highly connected, multi-hop relationship query, which relational joins handle poorly at scale.
Resource: <https://docs.aws.amazon.com/neptune/latest/userguide/intro.html>
</details>

**30.** A solutions architect is putting together a one-page cheat sheet mapping workloads to AWS purpose-built databases before a project kickoff. Which pairing is CORRECT?
- A. MongoDB-compatible documents → Keyspaces; Cassandra (CQL) → DocumentDB; IoT time series → Timestream
- B. MongoDB-compatible documents → Timestream; Cassandra (CQL) → Keyspaces; IoT time series → DocumentDB
- C. MongoDB-compatible documents → DocumentDB; Cassandra (CQL) → Neptune; IoT time series → Keyspaces
- D. MongoDB-compatible documents → DocumentDB; Cassandra (CQL) → Keyspaces; IoT time series → Timestream

<details><summary>Answer</summary>

**D.** Amazon DocumentDB is MongoDB-compatible, Amazon Keyspaces is Cassandra (CQL)-compatible, and Amazon Timestream is purpose-built for time-series data such as IoT telemetry.
Resource: <https://aws.amazon.com/products/databases/>
</details>

**31.** A DynamoDB table used for a flash-sale feature gets throttled on just a handful of keys — the items for today's three featured products — even though the table's aggregate provisioned capacity is nowhere near fully used. What is the likely cause and fix?
- A. TTL is deleting items too slowly; lower the TTL values on the hot items
- B. A hot partition; choose a higher-cardinality partition key or add write sharding
- C. Global tables are disabled; add a replica Region to spread the writes
- D. The table is out of storage; request a storage quota increase for the table

<details><summary>Answer</summary>

**B.** Throttling on a small number of keys while overall capacity is underused is the classic sign of a hot partition. Choosing a partition key with higher cardinality, or sharding the write key, spreads the load across more partitions.
Resource: <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html>
</details>

**32.** A gaming company needs an in-memory data store for real-time leaderboards and matchmaking queues that supports complex data types like sorted sets, can persist data to disk, and replicates with Multi-AZ automatic failover. Which should it choose?
- A. ElastiCache for Redis OSS (or Valkey)
- B. ElastiCache for Memcached
- C. Amazon EFS with Elastic Throughput
- D. DynamoDB Accelerator (DAX)

<details><summary>Answer</summary>

**A.** Redis OSS (and Valkey) supports rich data types like sorted sets, persistence, and Multi-AZ replication with automatic failover. Memcached is simple, multi-threaded, and has neither persistence nor built-in replication.
Resource: <https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html>
</details>

---

## Task 3.4: Determine high-performing and/or scalable network architectures

**33.** A media site serves both static assets and dynamic, personalized pages to a global audience, and the origin server's CPU spikes noticeably every time a popular article gets shared on social media. The team wants to reduce both latency for users and load on the origin. What should it use?
- A. A larger ALB
- B. Amazon CloudFront
- C. Route 53 simple routing
- D. AWS Global Accelerator for HTTP caching

<details><summary>Answer</summary>

**B.** CloudFront caches content at edge locations close to users, cutting both latency and the number of requests that reach the origin. Global Accelerator improves routing to endpoints but doesn't cache content.
Resource: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html>
</details>

**34.** A company has grown to 50 VPCs plus several on-premises networks that all need to reach each other, and the network team has given up trying to keep a full mesh of VPC peering connections and route tables consistent. What is the BEST solution?
- A. AWS Transit Gateway (hub-and-spoke)
- B. A full mesh of VPC peering connections
- C. Internet gateways
- D. A NAT gateway in each VPC

<details><summary>Answer</summary>

**A.** Transit Gateway acts as a central hub that all VPCs and on-premises connections attach to once, replacing the need for a full, non-transitive mesh of peering connections.
Resource: <https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html>
</details>

**35.** VPC A is peered with VPC B, and VPC B is separately peered with VPC C, for two unrelated projects that happened to both use VPC B as a hub. A developer in VPC A assumes that since both VPCs are peered with B, reaching a server in VPC C will just work. Can VPC A reach VPC C through B?
- A. Yes, traffic is routed through VPC B automatically
- B. No, VPC peering doesn't support transitive routing
- C. Yes, if A's route table sends C's CIDR to the A–B peering connection
- D. Only for IPv6 traffic between the VPCs

<details><summary>Answer</summary>

**B.** VPC peering connections are never transitive, no matter how route tables are configured, so A cannot reach C through B over peering alone.
Resource: <https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html>
</details>

**36.** A manufacturing company transfers huge CAD files between its data center and AWS all day, and needs a dedicated, consistent, high-bandwidth private connection — around 10 Gbps — rather than a connection that competes with everyone else's traffic over the internet. What should it use?
- A. Client VPN
- B. AWS Direct Connect
- C. An internet gateway
- D. Site-to-Site VPN

<details><summary>Answer</summary>

**B.** Direct Connect provides a dedicated, private network connection with consistent bandwidth up to 10 Gbps (or more with multiple connections), unlike a VPN, which runs encrypted over the shared public internet.
Resource: <https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html>
</details>

**37.** A retail chain has a dozen branch offices, each with its own Site-to-Site VPN connection into the same virtual private gateway, and now wants the branches to be able to reach each other over those existing VPN connections too, without buying Direct Connect for every branch. What should the company use?
- A. AWS VPN CloudHub, with a unique BGP ASN for each branch
- B. AWS PrivateLink interface endpoints for each branch office
- C. A Direct Connect transit virtual interface for each branch office
- D. VPC peering connections between the VPC and each branch office

<details><summary>Answer</summary>

**A.** VPN CloudHub uses the virtual private gateway as a hub that routes traffic between the existing VPN connections, and each branch's customer gateway needs its own BGP ASN. (For much larger global networks, AWS Cloud WAN is the managed alternative.)
Resource: <https://docs.aws.amazon.com/vpn/latest/s2svpn/VPN_CloudHub.html>
</details>

**38.** While designing a new VPC that will eventually need Site-to-Site VPN connections to three on-premises data centers and peering with two other VPCs, what is a key consideration for choosing the VPC's CIDR block?
- A. Create one subnet that spans every AZ so instances can move freely
- B. Avoid overlap with on-premises and other VPC CIDRs, and size subnets for growth
- C. Overlapping CIDRs are fine, because VPC peering translates addresses
- D. Always use /28 subnets so each subnet wastes as few addresses as possible

<details><summary>Answer</summary>

**B.** Overlapping CIDRs break routing for VPC peering and VPN/Direct Connect connections back to on-premises networks, so planning non-overlapping ranges (and subnets sized with room to grow) up front avoids costly re-addressing later.
Resource: <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html>
</details>

**39.** After a hybrid-DNS project, on-premises servers need to resolve names in a private Route 53 hosted zone, and resources inside the VPC need to resolve on-premises domain names — in both directions — without exposing either DNS namespace publicly. What should be used?
- A. A CloudFront distribution with a Route 53 alias record
- B. Route 53 Resolver inbound and outbound endpoints with forwarding rules
- C. A DHCP options set that points the VPC at the on-premises DNS servers
- D. Public hosted zones that contain copies of the private records

<details><summary>Answer</summary>

**B.** Route 53 Resolver inbound endpoints let on-premises systems query the private hosted zone, and outbound endpoints with forwarding rules let VPC resources query on-premises DNS — together covering both directions privately.
Resource: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html>
</details>

**40.** An HPC cluster's MPI jobs are bottlenecked by inter-instance network performance, and the team wants to push throughput toward 100+ Gbps between instances while also cutting latency and jitter as much as possible. What should it enable?
- A. Enhanced networking with ENA, plus EFA for HPC
- B. An Elastic IP address on each instance
- C. VPC Flow Logs with a 1-minute aggregation interval
- D. A NAT gateway in each Availability Zone

<details><summary>Answer</summary>

**A.** Enhanced networking with ENA supports up to 100+ Gbps on supported instance types, and adding Elastic Fabric Adapter (EFA) provides OS-bypass networking that further cuts latency and jitter for MPI/HPC workloads.
Resource: <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking.html>
</details>

---

## Task 3.5: Determine high-performing data ingestion and transformation solutions

**41.** A ride-hailing app's clickstream and GPS ping data must be ingested in real time, processed independently by a fraud-detection consumer and a separate analytics consumer, and be replayable for up to 7 days if a consumer needs to reprocess history after a bug fix. What should be used?
- A. Amazon Kinesis Data Streams
- B. Amazon S3 event notifications
- C. Amazon SQS standard queue
- D. Amazon SNS standard topic

<details><summary>Answer</summary>

**A.** Kinesis Data Streams retains data for a configurable period (up to 365 days) and lets multiple independent consumers read the same stream, with enhanced fan-out available for isolated per-consumer throughput.
Resource: <https://docs.aws.amazon.com/streams/latest/dev/introduction.html>
</details>

**42.** A company wants to load streaming IoT sensor data into S3, Redshift, and OpenSearch in near real time, with an optional Lambda step to enrich records and convert the format to Parquet along the way — and no servers or clusters for the team to run. What fits?
- A. Amazon Data Firehose
- B. AWS Glue batch jobs
- C. AWS DataSync
- D. Kinesis Data Streams with custom consumers

<details><summary>Answer</summary>

**A.** Data Firehose is a fully managed delivery service that loads streaming data into destinations like S3, Redshift, and OpenSearch, with optional Lambda transformation and format conversion, and nothing to provision.
Resource: <https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html>
</details>

**43.** A small analytics team wants to run occasional, ad hoc SQL queries directly against CSV and Parquet log files already sitting in S3, without standing up a database or a cluster, and would rather pay per query than pay for idle compute between reports. What should they use?
- A. Amazon RDS for PostgreSQL, after importing the files
- B. An Amazon Redshift provisioned cluster
- C. Amazon Athena with the AWS Glue Data Catalog
- D. An always-on Amazon EMR cluster running Hive

<details><summary>Answer</summary>

**C.** Athena runs serverless, pay-per-query SQL directly against files in S3, using the Glue Data Catalog for schema — partitioning and columnar formats reduce the data scanned, and so the cost, without any cluster to manage.
Resource: <https://docs.aws.amazon.com/athena/latest/ug/what-is.html>
</details>

**44.** A data platform team is building a data lake fed by a dozen different source systems and needs serverless ETL jobs plus automatic schema discovery, all recorded in one central metadata catalog that other services like Athena and Redshift Spectrum can query against. What should it use?
- A. Amazon EMR
- B. AWS Lambda only
- C. AWS Glue
- D. Amazon QuickSight

<details><summary>Answer</summary>

**C.** AWS Glue provides serverless ETL, crawlers for automatic schema discovery, and a central Data Catalog that Athena, Redshift Spectrum, and other services can query against. (Lake Formation adds fine-grained permissions on top of that same catalog.)
Resource: <https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html>
</details>

**45.** A company is closing an on-premises data center in six weeks and must move 500 TB of archival data to S3 before the lease ends, but the site's internet link is only 100 Mbps and can't be upgraded in time. What is the BEST option?
- A. AWS Snowball Edge devices
- B. Site-to-Site VPN
- C. S3 Transfer Acceleration
- D. AWS DataSync over the internet

<details><summary>Answer</summary>

**A.** Moving 500 TB over a 100 Mbps link would take well over a year, ruling out every network-based option here. Snowball Edge devices physically ship the data instead. (Snowball Edge is no longer available to new customers; AWS now points them to DataSync, AWS Data Transfer Terminal, or partner solutions, but the exam still tests this offline-transfer concept.)
Resource: <https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html>
</details>
