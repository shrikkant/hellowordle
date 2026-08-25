pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        COMPOSE_PROJECT_NAME = 'wordbaazi'
        WEB_PORT = '7654'
    }

    stages {
        // Compile checks run inside the Dockerfiles' build stages. Build-context
        // builds are safe with the host-socket setup (no volume mounts, which
        // would resolve paths on the HOST, not in the Jenkins container).
        stage('Test: server') {
            steps {
                sh 'docker build --target build ./server'
            }
        }
        stage('Test: web') {
            steps {
                sh 'docker build --target build ./web'
            }
        }
        stage('Build images') {
            steps {
                withCredentials([
                    string(credentialsId: 'wordbaazi-jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'wordbaazi-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
                ]) {
                    sh 'docker compose build --pull'
                }
            }
        }
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'wordbaazi-jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'wordbaazi-google-client-id', variable: 'GOOGLE_CLIENT_ID'),
                ]) {
                    sh 'docker compose up -d --remove-orphans'
                }
            }
        }
        stage('Smoke test') {
            steps {
                // Hit the deployed stack through nginx from inside the compose network
                sh '''
                    sleep 3
                    docker run --rm --network wordbaazi_default curlimages/curl:latest \
                        -sf http://web/api/health
                    docker run --rm --network wordbaazi_default curlimages/curl:latest \
                        -sf -o /dev/null http://web/
                '''
            }
        }
    }

    post {
        success {
            echo "Deployed: http://localhost:${WEB_PORT}"
        }
        failure {
            sh 'docker compose ps || true'
            sh 'docker compose logs --tail=50 || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
