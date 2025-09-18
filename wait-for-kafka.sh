#!/bin/bash

set -e

# Параметры Kafka
KAFKA_BROKER_LIST="connectfy-kafka-0:9092,connectfy-kafka-1:9092"

# Функция проверки доступности Kafka
check_kafka() {
  echo "Checking Kafka availability..."
  until kafka-topics.sh --bootstrap-server $KAFKA_BROKER_LIST --list &>/dev/null; do
    echo "Kafka is not available yet. Waiting..."
    sleep 5
  done
  echo "Kafka is available."
}

# Выполнение функции проверки
check_kafka