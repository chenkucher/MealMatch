echo "building app"
npm run build

echo "deploying files to server"
ssh chenkc@http://vmedu265.mtacloud.co.il "sudo cp -rf /var/www/MealMatch /var/www/MealMatch_backup && sudo rm -rf /var/www/MealMatch/* && sudo rm -rf /var/www/MealMatch/.git && sudo git clone https://github.com/chenkucher/MealMatch.git /var/www/MealMatch/"

echo restarting services
ssh chenkc@http://vmedu265.mtacloud.co.il "sudo systemctl restart react.service myflaskapp.service"
# echo "deploying backend files to server"

# scp -r build/* chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch/
# scp -rf /Users/chenkuchiersky/Desktop/MealMatch/MealMatch-1/client/* chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch/client
# cp -rf /Users/chenkuchiersky/Desktop/MealMatch/MealMatch-1/app.py chenkc@vmedu265.mtacloud.co.il:/var/www/MealMatch/app.py
echo "DONE!"