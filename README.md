For testing, first create development build and then run project using
npx expo start --dev-client


For creating build use below command/ for preview build only:
eas build -p android --profile preview

Use below for development build and testing:
eas build -p android --profile development

For creating prod build(uploading on play-store) use:
eas build

Start project locally:
npx expo start