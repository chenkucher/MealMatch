echo "building app"
npm run build

echo "deploying files to server"
scp -r build/* chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch
scp -rf /Users/chenkuchiersky/Desktop/MealMatch/MealMatch-1/client/* chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch/client
cp -rf /Users/chenkuchiersky/Desktop/MealMatch/MealMatch-1/app.py chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch/app.py
echo "DONE!"