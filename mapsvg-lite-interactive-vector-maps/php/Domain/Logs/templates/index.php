<!DOCTYPE html>
<html>

<head>
  <title>Logs</title>
  <!-- Add Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>
  <div class="container mt-4">
    <h1>Logs</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th style="width: 240px;">Datetime</th>
          <th>Message</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <?php
        function getBadgeClass($type)
        {
          switch ($type) {
            case 'ERROR':
              return 'bg-danger'; // Updated for Bootstrap 5
            case 'WARNING':
              return 'bg-warning'; // Updated for Bootstrap 5
            case 'INFO':
              return 'bg-info'; // Updated for Bootstrap 5
            default:
              return 'bg-secondary'; // Updated for Bootstrap 5
          }
        }
        ?>
        <?php if (isset($logs["items"]) && is_array($logs["items"])) foreach ($logs["items"] as $log): ?>
          <tr>
            <td><?php echo htmlspecialchars($log["datetime"]); ?></td>
            <td><?php echo htmlspecialchars($log["message"]); ?></td>
            <td><span class="badge <?php echo getBadgeClass($log["type"]); ?>"><?php echo htmlspecialchars($log["type"]); ?></span></td>
          </tr>

          <?php if (!empty($log["stack_trace"])): ?>
            <tr>
              <td colspan="3">
                <ul>
                  <?php foreach ($log["stack_trace"] as $trace): ?>
                    <li><?php echo htmlspecialchars($trace); ?></li>
                  <?php endforeach; ?>
                </ul>
              </td>
            </tr>
          <?php endif; ?>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</body>

</html>