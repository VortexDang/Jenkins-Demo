pipeline {
    agent any

    environment {
        MYSQL_DATABASE_NAME = 'cicd_demo'
        AWS_ECR_URL = "355187859189.dkr.ecr.us-east-1.amazonaws.com/pipeline-demo"
        TASK_DEF_NAME = "pipeline-demo-app"
        CLUSTER_NAME = "pipeline-demo"
    }

    tools {
        dockerTool 'myDocker'
    }

    stages {
        stage('Build and Push Docker Image to ECR') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'awsCredentials', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ECR_URL"
                    }

                    sh 'docker build -t pipeline-demo .'
                    sh 'docker tag pipeline-demo:latest $AWS_ECR_URL:latest'
                    sh 'docker push $AWS_ECR_URL:latest'
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'awsCredentials', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                        sh """
                        aws ecs update-service --cluster $CLUSTER_NAME --service pipeline-demo-app --force-new-deployment
                        """
                    }
                }
            }
        }
        
    }

    post {
        always {
            cleanWs()
        }
    }
}