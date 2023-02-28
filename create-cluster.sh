KEY_PAIR=leetcoin-cluster
    ecs-cli up \
      --keypair $KEY_PAIR  \
      --capability-iam \
      --size 2 \
      --instance-type t3.medium \
      --tags project=leetcoin-cluster,owner=noirkombatman \
      --cluster-config default \
      --ecs-profile default --force
