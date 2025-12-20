#!/bin/bash
echo -e "${GREEN}🎉 Ready for deployment!${NC}"
echo ""
echo "   sudo systemctl restart jts"
echo "3. Start the application on VPS:"
echo ""
echo "   scp $JAR_FILE root@YOUR_VPS_IP:/opt/jts/"
echo "2. Upload to VPS:"
echo ""
echo "   java -jar $JAR_FILE --spring.profiles.active=prod"
echo "1. Test the JAR locally:"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo -e "${GREEN}📦 JAR file created: $JAR_FILE${NC}"
echo -e "${GREEN}✅ Build successful!${NC}"

fi
    exit 1
    echo -e "${RED}❌ JAR file not found in target directory${NC}"
if [ -z "$JAR_FILE" ]; then

JAR_FILE=$(ls target/*.jar | grep -v original)
# Get the JAR file name

fi
    exit 1
    echo -e "${RED}❌ Build failed${NC}"
if [ $? -ne 0 ]; then

mvn package -DskipTests -Pprod
echo -e "${YELLOW}🔨 Building application...${NC}"

fi
    exit 1
    echo -e "${RED}❌ Clean failed${NC}"
if [ $? -ne 0 ]; then

mvn clean
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"

fi
    exit 1
    echo -e "${RED}❌ Maven is not installed. Please install Maven first.${NC}"
if ! command -v mvn &> /dev/null; then
# Check if Maven is installed

NC='\033[0m' # No Color
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
# Colors for output

echo "🚀 Starting JTS Application Production Build..."

# This script builds the application for production deployment
# JTS Application Production Build Script


