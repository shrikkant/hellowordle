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
        // Optional: set to a Google OAuth Web client ID to enable Sign in with
        // Google (also baked into the web bundle at image build time).
        GOOGLE_CLIENT_ID = '926645167761-nk4gukuu06oj19hg2md7tlkff6a9u2gm.apps.googleusercontent.com'
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
                    string(credentialsId: 'afx-prod-deploy-target', variable: 'JWT_SECRET'),
                ]) {
                    sh 'docker compose build --pull'
                }
            }
        }
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'afx-prod-deploy-target', variable: 'JWT_SECRET'),
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
