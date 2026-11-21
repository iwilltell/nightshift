
export interface GitHubContributionData {
  totalCommitContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
    }>;
  }>;
}

export interface GitHubRepository {
  createdAt: string;
}

export interface GitHubActivity {
  commitsLast30Days: number;
  daysSinceLastCommit: number;
  repositoriesCreatedLast90Days: number;
  daysSinceLastRepositoryCreated: number;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(
        first: 100,
        ownerAffiliations: OWNER,
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        nodes {
          createdAt
        }
      }
    }
  }
`;

interface GitHubQueryData {
  user: {
    contributionsCollection: GitHubContributionData & {
      contributionCalendar: {
        weeks: GitHubContributionData["weeks"];
      };
    };
    repositories: {
      nodes: GitHubRepository[];
    };
  } | null;
}

export class GitHubApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export async function fetchGitHubActivity(
  username: string,
  token: string,
  now: Date = new Date()
): Promise<GitHubActivity> {
  if (!username.trim()) {
    throw new GitHubApiError("GitHub username is required.");
  }

  if (!token.trim()) {
    throw new GitHubApiError("GitHub token is required.");
  }

  const to = now;
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 89);

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        username,
        from: from.toISOString(),
        to: to.toISOString()
      }
    })
  });

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API request failed: ${response.status} ${response.statusText}`
    );
  }

  const result =
    (await response.json()) as GraphQLResponse<GitHubQueryData>;

  if (result.errors?.length) {
    throw new GitHubApiError(
      result.errors.map(error => error.message).join("; ")
    );
  }

  const user = result.data?.user;

  if (!user) {
    throw new GitHubApiError(`GitHub user "${username}" was not found.`);
  }

  const days = user.contributionsCollection.contributionCalendar.weeks
    .flatMap(week => week.contributionDays);

  const cutoff = new Date(to);
  cutoff.setUTCDate(cutoff.getUTCDate() - 29);

  const commitsLast30Days = days
    .filter(day => new Date(`${day.date}T00:00:00Z`) >= cutoff)
    .reduce((total, day) => total + day.contributionCount, 0);

  const lastCommit = [...days]
    .reverse()
    .find(day => day.contributionCount > 0);

  const daysSinceLastCommit = lastCommit
    ? Math.max(
        0,
        Math.floor(
          (Date.UTC(
            to.getUTCFullYear(),
            to.getUTCMonth(),
            to.getUTCDate()
          ) -
            Date.parse(`${lastCommit.date}T00:00:00Z`)) /
            86_400_000
        )
      )
    : 90;

  const repositoryCutoff = new Date(to);
  repositoryCutoff.setUTCDate(repositoryCutoff.getUTCDate() - 90);

  const recentRepositories = user.repositories.nodes.filter(
    repo => new Date(repo.createdAt) >= repositoryCutoff
  );

  const latestRepository = user.repositories.nodes[0];

  const daysSinceLastRepositoryCreated = latestRepository
    ? Math.max(
        0,
        Math.floor(
          (to.getTime() - new Date(latestRepository.createdAt).getTime()) /
            86_400_000
        )
      )
    : 90;

  return {
    commitsLast30Days,
    daysSinceLastCommit,
    repositoriesCreatedLast90Days: recentRepositories.length,
    daysSinceLastRepositoryCreated
  };
}
