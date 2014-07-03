<?php
echo "Hello world!\n";
?>

<form action="video_upload.php" method="post" enctype="multipart/form-data">
  Send these files:<br />
  <input name="video_1" type="file" /><br /><br />
  <input type="submit" value="Send files" />
</form>
