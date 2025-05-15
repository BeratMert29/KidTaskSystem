package com.Web.WebBackend.Repository;

import com.Web.WebBackend.Model.WishModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishRepository extends JpaRepository<WishModel,Integer> {
    List<WishModel> findByStudentModelId(Integer studentId);

    List<WishModel> findByStudentModelIdAndIsApprovedFalse(Integer id);

    List<WishModel> findByStudentModelIdAndIsApprovedTrue(Integer studentId);

    List<WishModel> findByStudentModelIdAndIsInShoplistTrue(Integer studentId);

    List<WishModel> findByStudentModelIdAndIsApprovedTrueAndPointsLessThanEqualAndLevelLessThanEqual(Integer studentId, int points, int level);

    List<WishModel> findByIsApprovedFalse();

    List<WishModel> findByApprovedByParentIdOrApprovedByTeacherId(Integer parentId, Integer teacherId);

    List<WishModel> findByStudentModelIdAndIsInWishlistTrue(Integer studentId);

    List<WishModel> findByStudentModelIdAndIsApprovedTrueAndIsInShoplistTrueAndPointsLessThanEqualAndLevelLessThanEqual(Integer studentId, Integer points, Integer level);

    List<WishModel> findByApprovedByParentId(Integer parentId);

    List<WishModel> findByIsApprovedFalseAndIsInWishlistTrue();
}
