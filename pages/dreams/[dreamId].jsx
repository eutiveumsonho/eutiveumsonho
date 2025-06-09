/** @module pages/dreams/:dreamId */
import Head from "next/head";
import Dream from "../../containers/dream";
import { getAuthProps } from "../../lib/auth";
import { truncate } from "../../lib/strings";
import {
  getPostById,
  getUserByEmail,
  getUserById,
  getComments,
} from "../../lib/db/reads";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getInsights } from "../../lib/data-analysis/word-frequency";
import { cosineSimilarityScore } from "../../lib/data-analysis/cosine-similarity";

/**
 * Dream page. This page shows a user's dream.
 *
 * @param {{ data, comments, serverSession }} props - The props this component gets from getServerSideProps
 */
export default function DreamPage(props) {
  const { data: rawData, comments: rawComments, insights: rawInsights, ...authProps } = props;

  const data = JSON.parse(rawData);
  const comments = JSON.parse(rawComments);
  const insights = JSON.parse(rawInsights);

  return (
    <>
      <Head>
        <title>{truncate(data.dream.text, 50, true)}</title>
      </Head>
      <Dream data={data} comments={comments} insights={insights} {...authProps} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res } = context;

  try {
    const { dreamId } = context.params;

    if (!authProps.props.serverSession) {
      const data = await getPostById(dreamId);

      if (data.visibility === "private") {
        res.setHeader("location", `/${context.locale}`);
        res.statusCode = 302;
        res.end();

        return { props: {} };
      }

      const user = await getUserById(data.userId);
      data.user = user;

      const comments = await getComments(dreamId);

      // Process insights on the server
      const dreamInsights = getInsights(data.dream.text);
      const topWords = dreamInsights.wordFrequency.slice(0, 20);
      
      const similarities = [];
      for (let i = 0; i < topWords.length; i++) {
        for (let j = i + 1; j < topWords.length; j++) {
          const similarity = cosineSimilarityScore(topWords[i].word, topWords[j].word);
          if (similarity > 0.1) {
            similarities.push({
              source: i,
              target: j,
              similarity: similarity,
              sourceWord: topWords[i].word,
              targetWord: topWords[j].word
            });
          }
        }
      }

      const insights = {
        words: topWords,
        similarities: similarities,
        characterCount: dreamInsights.characterCount
      };

      return {
        props: {
          ...authProps.props,
          data: JSON.stringify(data),
          comments: JSON.stringify(comments),
          insights: JSON.stringify(insights),
          ...getUserAgentProps(context),
          ...(await serverSideTranslations(context.locale, [
            "layout",
            "footer",
            "common",
          ])),
        },
      };
    }

    let [data, user] = await Promise.all([
      getPostById(dreamId),
      getUserByEmail(authProps.props.serverSession.user.email),
    ]);

    const isDreamOwner = user._id.toString() === data.userId.toString();

    if (data.visibility === "private" && !isDreamOwner) {
      res.setHeader("location", `/${context.locale}/dreams`);
      res.statusCode = 302;
      res.end();

      return {
        props: {
          ...getUserAgentProps(context),
          ...(await serverSideTranslations(context.locale, [
            "dashboard",
            "common",
          ])),
        },
      };
    }

    if (data.visibility === "anonymous") {
      delete data.userId;
    } else {
      if (isDreamOwner) {
        data.user = user;
      } else {
        const user = await getUserById(data.userId);
        data.user = user;
      }
    }

    const comments = await getComments(dreamId);

    // Process insights on the server
    const dreamInsights = getInsights(data.dream.text);
    const topWords = dreamInsights.wordFrequency.slice(0, 20);
    
    const similarities = [];
    for (let i = 0; i < topWords.length; i++) {
      for (let j = i + 1; j < topWords.length; j++) {
        const similarity = cosineSimilarityScore(topWords[i].word, topWords[j].word);
        if (similarity > 0.1) {
          similarities.push({
            source: i,
            target: j,
            similarity: similarity,
            sourceWord: topWords[i].word,
            targetWord: topWords[j].word
          });
        }
      }
    }

    const insights = {
      words: topWords,
      similarities: similarities,
      characterCount: dreamInsights.characterCount
    };

    return {
      props: {
        ...authProps.props,
        data: JSON.stringify(data),
        comments: JSON.stringify(comments),
        insights: JSON.stringify(insights),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError(error, {
      service: "web",
      pathname: "/dreams/[dreamId]",
      component: "DreamPage",
    });
  }
}
