{
  "name": "LTZRPGPlayer",
  "platforms": [
    {
      "name": "ios",
      "version": "16.0"
    }
  ],
  "targets": [
    {
      "name": "LTZRPGPlayer",
      "dependencies": [],
      "type": "library",
      "path": "Sources/LTZRPGPlayer"
    },
    {
      "name": "LTZRPGPlayerApp",
      "dependencies": ["LTZRPGPlayer"],
      "type": "executable",
      "path": "Sources/LTZRPGPlayerApp",
      "settings": [
        {
          "key": "SWIFT_VERSION",
          "value": "5.0"
        }
      ]
    }
  ]
}