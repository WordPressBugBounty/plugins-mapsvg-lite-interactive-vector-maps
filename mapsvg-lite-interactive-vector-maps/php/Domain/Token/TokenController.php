<?php

namespace MapSVG;

class TokenController extends Controller
{
	/**
	 * Retrieves all tokens from the database.
	 *
	 * @return \WP_REST_Response A response containing all tokens, with a 200 status code.
	 */
	public static function index()
	{
		$tokenRepo = RepositoryFactory::get("token");
		// Fetch all tokens from the database
		$tokens = $tokenRepo->find();
		// Return the masked tokens in the response
		return new \WP_REST_Response($tokens, 200);
	}

	/**
	 * Creates a new token.
	 *
	 * @param array $request The request data containing token information.
	 * @return \WP_REST_Response A response containing the created token or an error message.
	 */
	public static function create($request)
	{
		if (!isset($request["token"])) {
			return new \WP_REST_Response(['error' => 'Token is required'], 400);
		}
		if (!isset($request["token"]["accessRights"])) {
			return new \WP_REST_Response(['error' => 'Token accessRights is required'], 400);
		}
		$tokenRepo = RepositoryFactory::get("token");
		$accessRights = $request["token"]['accessRights'];
		array_walk_recursive($accessRights, function (&$item) {
			if ($item === 'true') {
				$item = true;
			} elseif ($item === 'false') {
				$item = false;
			}
		});
		$token = new Token(["accessRights" => $accessRights]);
		$rawToken = $token->getRawToken();
		$savedToken = $tokenRepo->create($token);
		$savedToken->token = $rawToken;

		// Enable debug logging if the token has logs access rights
		// if ($savedToken->hasPermission('logs')) {
		// 	$logConfig = new LogConfig();
		// 	if (!$logConfig->isEnabled()) {
		// 		$logConfig->enable();
		// 	}
		// }

		if ($savedToken->hasPermission("wp")) {
			self::createUser($rawToken);
		}

		if ($savedToken) {
			return new \WP_REST_Response(["token" => $savedToken], 201);
		} else {
			return new \WP_REST_Response(['error' => 'Failed to create token'], 500);
		}
	}

	/**
	 * Deletes a token.
	 *
	 * @param array $request The request data containing the token ID or token string.
	 * @return \WP_REST_Response A response indicating success or failure.
	 */
	public static function delete($request)
	{
		$tokenRepo = RepositoryFactory::get("token");
		$token = null;

		if (is_numeric($request['id'])) {
			$token = $tokenRepo->findOne(["id" => $request['id']]);
		} elseif (ctype_alnum($request['token'])) {
			$token = $tokenRepo->findOne(["token" => md5($request['token'])]);
		}

		if ($token) {
			if ($token->hasPermission("wp")) {
				// Check if there are any remaining tokens with 'wp' permission
				$remainingTokens = $tokenRepo->find();
				$hasWpPermission = false;

				foreach ($remainingTokens["items"] as $remainingToken) {
					if ($remainingToken->id !== $token->id && $remainingToken->hasPermission("wp")) {
						$hasWpPermission = true;
						break;
					}
				}

				// Only delete the user if there are no remaining tokens with 'wp' permission
				if (!$hasWpPermission) {
					self::deleteUser();
				}
			}
			$tokenRepo->delete($token->id);
			return new \WP_REST_Response([], 200);
		} else {
			return new \WP_REST_Response([], 404);
		}
	}

	/**
	 * Updates the last used timestamp of a token.
	 *
	 * @param array $request The request data containing the token string.
	 * @return \WP_REST_Response A response containing the updated token or an error message.
	 */
	public static function touch($request)
	{
		$tokenRepo = RepositoryFactory::get("token");
		$token = $tokenRepo->findOne(["token" => md5($request['token'])]);

		if ($token) {
			// Use current UTC timestamp
			$token->lastUsedAt = gmdate('Y-m-d H:i:s');
			$tokenRepo->update($token);
			return new \WP_REST_Response(["token" => $token], 200);
		} else {
			return new \WP_REST_Response(['error' => 'Token not found'], 404);
		}
	}

	/**
	 * Deletes the MapSVG user
	 * @return void
	 */
	private static function deleteUser()
	{
		$userName = "mapsvg";
		$user = get_user_by('login', $userName);

		if ($user) {
			if (is_multisite()) {
				// If it's a multisite installation, use wpmu_delete_user
				require_once(ABSPATH . 'wp-admin/includes/ms.php');
				wpmu_delete_user($user->ID);
			} else {
				// For single site installations, use wp_delete_user
				require_once(ABSPATH . 'wp-admin/includes/user.php');
				wp_delete_user($user->ID);
			}
		}
		// If user doesn't exist, we don't need to do anything
	}

	private static function createUser($password)
	{
		$userName = "mapsvg";
		$userEmail = "support@mapsvg.com";
		$userEmailExists = email_exists($userEmail);
		$userNameExists = username_exists($userName);
		$random_password = $password;

		if (! $userNameExists && !$userEmailExists) {
			if (is_multisite()) {
				// For multisite, use wpmu_create_user
				$user_id = wpmu_create_user($userName, $random_password, $userEmail);
				if ($user_id) {
					// Add user to the current site as an administrator
					add_user_to_blog(get_current_blog_id(), $user_id, 'administrator');
				}
			} else {
				// For single site, use wp_insert_user
				$user_id = wp_insert_user([
					"user_login" => $userName,
					"user_pass" => $random_password,
					"user_email" => $userEmail,
					"role" => "administrator",
					"locale" => "en_US"
				]);
			}

			if (is_wp_error($user_id)) {
				return self::render(["error" => $user_id->get_error_message()], 400);
			}
		} else {
			$user_id_to_update = is_int($userNameExists) ? $userNameExists : (is_int($userEmailExists) ? $userEmailExists : null);
			if ($user_id_to_update) {
				wp_set_password($random_password, $user_id_to_update);
				$userdata = array(
					'ID'         => $user_id_to_update,
					'user_login' => $userName,
					'user_email' => $userEmail
				);
				$result = wp_update_user($userdata);
				if (is_wp_error($result)) {
					return self::render(["error" => $result->get_error_message()], 400);
				}
				$user_id = $user_id_to_update;
			}
		}

		return $user_id;
	}
}
