var glob = require('glob');
var fs = require('fs');
var mm = require('musicmetadata');

angular.module('app')
    .controller('MainController', ($scope, FileService, $timeout, ngAudio) => {
        $scope.activeFile = undefined
        $scope.searchFilter="";

        $scope.selectedFolder = undefined
        $scope.musicFiles = [];

        $scope.art ="";
        $scope.temp ="";

        let currentIndex;
        $scope.searchFilterFun = function(val){
            $scope.temp = val.searchFilter;
            
        }


        function isMusicFile(file) {
            let extension = file.name.split('.').pop()
            return extension === 'mp3'
        }

        $scope.onFolderSelected = (event) => {
            $scope.showMusicsInFolder(event.target.files[0].path)
            $scope.selectedFolder = event.target.files[0].path
        }

        $scope.showMusicsInFolder = (path) => {
            $scope.musicFiles = [];
            var getDirectories = function (src, callback) {
                glob(src + '/**/*.mp3', callback);
              };
              getDirectories(path, function (err, res) {
                res.forEach(filePath => {
                    var duration = "";
                      
                         fs.statAsync(filePath)
                            .then(stats => {
                                return {
                                    name: filePath.substring(filePath.lastIndexOf('/')+1,filePath.length),
                                    type: 'File',
                                    path: filePath,
                                    duration: duration
                                }
                            }).then(function(data){
                                $timeout(function() {
                                    $scope.musicFiles.push(data)
                                    if($scope.musicFiles.length == 1){
                                        $scope.playMusic($scope.musicFiles[0],0);
                                    }
                                })
                            })
                });
              });
        }

        $scope.playMusic = (file, index) => {
            $scope.activeFile = file
            currentIndex = index
            $scope.currentFile = file.name.split('.')[0];
            if($scope.currentFile.length>17){
                $scope.currentFile = $scope.currentFile.substring(0,16) + "...";
            }
            var parser = mm(fs.createReadStream(file.path), function (err, metadata) {
                if (err) throw err;
                var imageUrl="./assets/images.jpg";
                if(metadata.picture && metadata.picture[0]){
                    var blob = new Blob( [ metadata.picture[0].data ], { type: "image/jpeg" } );
                    var urlCreator = window.URL || window.webkitURL;
                    imageUrl = urlCreator.createObjectURL( blob );
                }
                var img = document.querySelector( "div.album-art img" );
                img.src = imageUrl;
              });

            if ($scope.activeSound) {
                $scope.activeSound.stop()
            }

            $scope.activeSound = ngAudio.load(file.path);
            $scope.activeSound.play()
        }

        $scope.playPause = () => {
            if ($scope.activeSound) {
                if ($scope.isPlaying()) {
                    $scope.activeSound.pause()
                } else {
                    $scope.activeSound.play()
                }
            }
        }

        $scope.nextSound = () => {
          currentIndex++
          if($scope.musicFiles[currentIndex]){

            $scope.playMusic($scope.musicFiles[currentIndex], currentIndex)
          }
        }

        $scope.prevSound = () => {
          currentIndex--
          if($scope.musicFiles[currentIndex]){
            $scope.playMusic($scope.musicFiles[currentIndex], currentIndex)
          }
        }

        $scope.isPlaying = () => {
            if ($scope.activeSound) {
                return !$scope.activeSound.paused
            }

        }

    })