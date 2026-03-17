pipeline {
    agent any

    environment {
        // Production paths
        FRONTEND_DIR = '/var/www/flask-app-frontend'
        BACKEND_DIR = '/var/www/flask-app-backend'
        
        // Ensure Jenkins runs with enough permissions or uses sudo
        // Note: For a real server, Jenkins user needs passwordless sudo for these commands
        // or the directories should be owned by the jenkins user.
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Fetching code from repository..."
                // checkout scm (uncomment in real git repo)
            }
        }

        stage('Deploy Frontend') {
            steps {
                echo "Deploying Static Frontend files to ${FRONTEND_DIR}"
                
                sh """
                    # Create directory if it doesn't exist
                    sudo mkdir -p ${FRONTEND_DIR}
                    
                    # Copy frontend files
                    sudo cp -r ${WORKSPACE}/frontend/* ${FRONTEND_DIR}/
                    
                    # Set permissions (adjust user/group as needed, e.g., www-data)
                    sudo chown -R \$USER:\$USER ${FRONTEND_DIR}
                """
            }
        }

        stage('Deploy Backend') {
            steps {
                echo "Setting up Python Environment in ${BACKEND_DIR}"
                
                sh """
                    sudo mkdir -p ${BACKEND_DIR}
                    sudo cp -r ${WORKSPACE}/backend/* ${BACKEND_DIR}/
                    sudo chown -R \$USER:\$USER ${BACKEND_DIR}
                    
                    cd ${BACKEND_DIR}
                    
                    # Create virtual environment if it doesn't exist
                    if [ ! -d "venv" ]; then
                        python3 -m venv venv
                    fi
                    
                    # Install requirements
                    ./venv/bin/pip install -r requirements.txt
                """
            }
        }

        stage('Restart Services') {
            steps {
                echo "Restarting Apache and Backend Application..."
                
                // Example of how you would restart a systemd service for the Flask app
                // You need to create this service on the server first (see README)
                sh """
                    # Restart backend service
                    sudo systemctl restart flask-backend.service || echo "Service restart failed. Ensure flask-backend.service exists."
                    
                    # Restart Apache
                    sudo systemctl restart apache2 || echo "Apache restart failed."
                """
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo "Waiting for services to be ready..."
                sleep time: 5, unit: 'SECONDS'
                
                // Test if the backend is responding locally
                sh "curl -s -f http://localhost:5000/api/status || exit 1"
            }
        }
    }

    post {
        always {
            echo "Pipeline run complete."
        }
        success {
            echo "Deployment successful! Frontend is in ${FRONTEND_DIR} and Backend is in ${BACKEND_DIR}."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
